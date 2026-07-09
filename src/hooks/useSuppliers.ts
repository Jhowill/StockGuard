import { useCallback, useEffect, useState } from 'react';
import {
  archiveSupplier,
  createSupplier,
  listSuppliers,
  updateSupplier,
} from '@/database/repositories/supplierRepository';
import type { Supplier } from '@/types/supplier';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setSuppliers(await listSuppliers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SUPPLIERS_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (input: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const next = await createSupplier(input);
    await refresh();
    return next;
  }, [refresh]);

  const edit = useCallback(async (id: string, input: Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const next = await updateSupplier(id, input);
    await refresh();
    return next;
  }, [refresh]);

  const archive = useCallback(async (id: string) => {
    await archiveSupplier(id);
    await refresh();
  }, [refresh]);

  return {
    suppliers,
    loading,
    error,
    refresh,
    create,
    edit,
    archive,
  };
}
