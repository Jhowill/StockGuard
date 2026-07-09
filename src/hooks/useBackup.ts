import { useCallback, useEffect, useState } from 'react';
import { listBackupRecords } from '@/database/repositories/backupRecordRepository';
import type { BackupRecord } from '@/types/backup';
import { exportBackupFile, restoreBackupFile, shareBackupFile } from '@/services/backupService';

export function useBackup() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setBackups(await listBackupRecords());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'BACKUP_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createBackup = useCallback(async () => {
    const result = await exportBackupFile();
    await refresh();
    return result;
  }, [refresh]);

  const restoreBackup = useCallback(async (fileUri: string) => {
    const result = await restoreBackupFile(fileUri);
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
