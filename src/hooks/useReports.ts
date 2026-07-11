import { useCallback, useEffect, useState } from 'react';
import { getReportSummary, type ReportPeriod, type ReportSummary } from '@/services/reportService';
import type { CurrencyCode } from '@/types/settings';

export function useReports(period: ReportPeriod = 'month', currency: CurrencyCode = 'BRL') {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const next = await getReportSummary(period, currency);
      setSummary(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'REPORTS_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, [currency, period]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    summary,
    loading,
    error,
    refresh,
  };
}
