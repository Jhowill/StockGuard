import { useCallback, useEffect, useRef, useState } from 'react';
import { listBackupRecords } from '@/database/repositories/backupRecordRepository';
import type { BackupRecord } from '@/types/backup';
import { exportBackupFile, restoreBackupFile, shareBackupFile } from '@/services/backupService';

export function useBackup() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(undefined);
    try {
      const nextBackups = await listBackupRecords();
      if (requestId === requestIdRef.current) {
        setBackups(nextBackups);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : 'BACKUP_LOAD_FAILED');
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

  const createBackup = useCallback(async (password?: string) => {
    const result = await exportBackupFile(password);
    await refresh();
    return result;
  }, [refresh]);

  const restoreBackup = useCallback(async (fileUri: string, password?: string) => {
    const result = await restoreBackupFile(fileUri, password);
    await refresh();
    return result;
  }, [refresh]);

  const shareBackup = useCallback(async (fileUri: string) => {
    await shareBackupFile(fileUri);
  }, []);

  return {
    backups,
    loading,
    error,
    refresh,
    createBackup,
    restoreBackup,
    shareBackup,
  };
}
