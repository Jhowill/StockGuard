import { useCallback, useEffect, useState } from 'react';
import { getLowStockProducts, listProducts } from '@/database/repositories/productRepository';
import { getRecentMovements, type StockMovementRecord } from '@/database/repositories/stockMovementRepository';
import { useSettings } from './useSettings';

export type DashboardSummary = {
  totalStockValueCents: number;
  activeProductsCount: number;
  lowStockCount: number;
  zeroStockCount: number;
  lastMovements: StockMovementRecord[];
};

export function useDashboard() {
  const { settings } = useSettings();
  const [summary, setSummary] = useState<DashboardSummary>({
    totalStockValueCents: 0,
    activeProductsCount: 0,
    lowStockCount: 0,
    zeroStockCount: 0,
    lastMovements: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [products, lowStockProducts, movements] = await Promise.all([
        listProducts(),
        getLowStockProducts(),
        getRecentMovements(5),
      ]);

      const totalStockValueCents = products.reduce(
        (sum, product) => sum + (product.quantity * (product.costPriceCents ?? 0)),
        0,
      );

      setSummary({
        totalStockValueCents,
        activeProductsCount: products.length,
        lowStockCount: lowStockProducts.length,
        zeroStockCount: products.filter((product) => product.quantity === 0).length,
        lastMovements: movements,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DASHBOARD_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, settings]);

  return {
    summary,
    loading,
    error,
    refresh,
  };
}
