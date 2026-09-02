import { useCallback, useEffect, useRef, useState } from 'react';
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
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(undefined);
    try {
      const nextSuppliers = await listSuppliers();
      if (requestId === requestIdRef.current) {
        setSuppliers(nextSuppliers);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : 'SUPPLIERS_LOAD_FAILED');
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
