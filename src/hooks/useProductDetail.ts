import { useCallback, useEffect, useState } from 'react';
import { findMovementsByProductId, type StockMovementRecord } from '@/database/repositories/stockMovementRepository';
import { findProductById, type ProductRecord } from '@/database/repositories/productRepository';

export function useProductDetail(productId?: string) {
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(async () => {
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

      setProduct(nextProduct);
      setMovements(nextMovements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PRODUCT_DETAIL_FAILED');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    product,
    movements,
    loading,
    error,
    refresh,
  };
}
