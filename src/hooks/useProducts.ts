import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { listProducts, searchProducts, type ProductRecord } from '@/database/repositories/productRepository';

export function useProducts() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [query, setQuery] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const list = query.trim() ? await searchProducts(query) : await listProducts();
      setProducts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PRODUCTS_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
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
