import { useCallback, useEffect, useState } from 'react';
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

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setCategories(await listCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CATEGORIES_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
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
