import { useCallback, useEffect, useRef, useState } from 'react';
import {
  archiveCategory,
  createCategory,
  listCategories,
  updateCategory,
} from '@/database/repositories/categoryRepository';
import type { Category } from '@/types/category';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(undefined);
    try {
      const nextCategories = await listCategories();
      if (requestId === requestIdRef.current) {
        setCategories(nextCategories);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : 'CATEGORIES_LOAD_FAILED');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
    return () => {
      requestIdRef.current += 1;
    };
  }, [refresh]);

  const create = useCallback(async (input: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const next = await createCategory(input);
    await refresh();
    return next;
  }, [refresh]);

  const edit = useCallback(async (id: string, input: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const next = await updateCategory(id, input);
    await refresh();
    return next;
  }, [refresh]);

  const archive = useCallback(async (id: string) => {
    await archiveCategory(id);
    await refresh();
  }, [refresh]);

  return {
    categories,
    loading,
    error,
    refresh,
    create,
    edit,
    archive,
  };
}
