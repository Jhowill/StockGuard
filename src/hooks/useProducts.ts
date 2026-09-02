import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { listProducts, searchProducts, type ProductRecord } from '@/database/repositories/productRepository';

export function useProducts() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(undefined);
    try {
      const list = query.trim() ? await searchProducts(query) : await listProducts();
      if (requestId === requestIdRef.current) {
        setProducts(list);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : 'PRODUCTS_LOAD_FAILED');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [query]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      return () => {
        requestIdRef.current += 1;
      };
    }, [refresh]),
  );

  const filtered = useMemo(() => products, [products]);

  return {
    products: filtered,
    query,
    setQuery,
    loading,
    error,
    refresh,
  };
}
