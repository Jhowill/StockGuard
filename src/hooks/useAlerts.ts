import { useCallback, useEffect, useMemo, useState } from 'react';
import { getExpiringProducts, getLowStockProducts, listProducts, type ProductRecord } from '@/database/repositories/productRepository';
import { getSettings } from '@/database/repositories/settingsRepository';

export type AlertItem = {
  id: string;
  kind: 'zero' | 'low' | 'expiring';
  tone: 'success' | 'warning' | 'danger' | 'info';
  count: number;
  products: ProductRecord[];
};

export function useAlerts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const settings = await getSettings();
      const [products, lowStock, expiringSoon] = await Promise.all([
        listProducts(),
        settings.lowStockWarningEnabled ? getLowStockProducts() : Promise.resolve([]),
        settings.expirationWarningEnabled ? getExpiringProducts(settings.expirationWarningDays) : Promise.resolve([]),
      ]);

      const zeroStock = products.filter((product) => product.quantity === 0);
      const nextAlerts = [
        {
          id: 'zero',
          kind: 'zero',
          tone: 'danger',
          count: zeroStock.length,
          products: zeroStock,
        },
        {
          id: 'low',
          kind: 'low',
          tone: 'warning',
          count: lowStock.length,
          products: lowStock,
        },
        {
          id: 'expiring',
          kind: 'expiring',
          tone: 'info',
          count: expiringSoon.length,
          products: expiringSoon,
        },
      ].filter((alert) => alert.count > 0) as AlertItem[];

      setAlerts(nextAlerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ALERTS_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const total = useMemo(() => alerts.reduce((sum, alert) => sum + alert.count, 0), [alerts]);

  return {
    alerts,
    total,
    loading,
    error,
    refresh,
  };
}
