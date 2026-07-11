import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getReportSummary, type ReportPeriod, type ReportSummary } from '@/services/reportService';
import type { CurrencyCode } from '@/types/settings';

export function useReports(period: ReportPeriod = 'month', currency: CurrencyCode = 'BRL') {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(undefined);
    try {
      const next = await getReportSummary(period, currency);
      if (requestId === requestIdRef.current) {
        setSummary(next);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : 'REPORTS_LOAD_FAILED');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [currency, period]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      return () => {
        requestIdRef.current += 1;
      };
    }, [refresh]),
  );

  return {
    summary,
    loading,
    error,
    refresh,
  };
}
