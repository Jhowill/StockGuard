import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getExpiringProducts, getLowStockProducts, listProducts, type ProductRecord } from '@/database/repositories/productRepository';
import { getRecentMovements, type StockMovementRecord } from '@/database/repositories/stockMovementRepository';
import { useSettings } from './useSettings';

export type DashboardMovement = StockMovementRecord & {
  productName: string;
};

export type DashboardSummary = {
  totalStockValueCents: number;
  activeProductsCount: number;
  lowStockCount: number;
  zeroStockCount: number;
  expiringSoonCount: number;
  lastMovements: DashboardMovement[];
};

export function useDashboard() {
  const { settings } = useSettings();
  const currency = settings?.currency ?? 'BRL';
  const [summary, setSummary] = useState<DashboardSummary>({
    totalStockValueCents: 0,
    activeProductsCount: 0,
    lowStockCount: 0,
    zeroStockCount: 0,
    expiringSoonCount: 0,
    lastMovements: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(undefined);
    try {
      const [products, lowStockProducts, expiringSoonProducts, movements] = await Promise.all([
        listProducts(),
        settings?.lowStockWarningEnabled === false ? Promise.resolve([]) : getLowStockProducts(),
        settings?.expirationWarningEnabled === false ? Promise.resolve([]) : getExpiringProducts(settings?.expirationWarningDays ?? 7),
        getRecentMovements(5),
      ]);
      const productMap = new Map<string, ProductRecord>(products.map((product) => [product.id, product]));

      const totalStockValueCents = products
        .filter((product) => product.currency === currency)
        .reduce(
        (sum, product) => sum + (product.quantity * (product.costPriceCents ?? 0)),
        0,
      );

      if (requestId === requestIdRef.current) {
        setSummary({
          totalStockValueCents,
          activeProductsCount: products.length,
          lowStockCount: lowStockProducts.length,
          zeroStockCount: products.filter((product) => product.quantity === 0).length,
          expiringSoonCount: expiringSoonProducts.length,
          lastMovements: movements.map((movement) => ({
            ...movement,
            productName: productMap.get(movement.productId)?.name ?? movement.productId,
          })),
        });
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : 'DASHBOARD_LOAD_FAILED');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [currency, settings?.expirationWarningDays, settings?.expirationWarningEnabled, settings?.lowStockWarningEnabled]);

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
