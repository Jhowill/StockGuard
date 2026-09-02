import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { findMovementsByProductId, type StockMovementRecord } from '@/database/repositories/stockMovementRepository';
import { findProductById, type ProductRecord } from '@/database/repositories/productRepository';

export function useProductDetail(productId?: string) {
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (!productId) {
      setError('PRODUCT_ID_MISSING');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      const [nextProduct, nextMovements] = await Promise.all([
        findProductById(productId),
        findMovementsByProductId(productId, 10),
      ]);

      if (requestId === requestIdRef.current) {
        setProduct(nextProduct);
        setMovements(nextMovements);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : 'PRODUCT_DETAIL_FAILED');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [productId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      return () => {
        requestIdRef.current += 1;
      };
    }, [refresh]),
  );

  return {
    product,
    movements,
    loading,
    error,
    refresh,
  };
}
