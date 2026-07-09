import * as Crypto from 'expo-crypto';
import { getDatabase } from '../db';
import type { BackupRecord } from '@/types/backup';
import { nowIso } from '@/utils/date';

type BackupRecordRow = {
  id: string;
  type: BackupRecord['type'];
  format: BackupRecord['format'];
  file_name: string | null;
  file_uri: string | null;
  file_size_bytes: number | null;
  encrypted: number;
  status: BackupRecord['status'];
  error_message: string | null;
  created_at: string;
};

function mapBackupRecord(row: BackupRecordRow): BackupRecord {
  return {
    id: row.id,
    type: row.type,
    format: row.format,
    fileName: row.file_name ?? undefined,
    fileUri: row.file_uri ?? undefined,
    fileSizeBytes: row.file_size_bytes ?? undefined,
    encrypted: row.encrypted === 1,
    status: row.status,
    errorMessage: row.error_message ?? undefined,
    createdAt: row.created_at,
  };
}

export async function createBackupRecord(input: Omit<BackupRecord, 'id' | 'createdAt'> & { createdAt?: string }) {
  const db = await getDatabase();
  const record: BackupRecord = {
    id: Crypto.randomUUID(),
    type: input.type,
    format: input.format,
    fileName: input.fileName,
    fileUri: input.fileUri,
    fileSizeBytes: input.fileSizeBytes,
    encrypted: input.encrypted,
    status: input.status,
    errorMessage: input.errorMessage,
    createdAt: input.createdAt ?? nowIso(),
  };

  await db.runAsync(
    `INSERT INTO backup_records (id, type, format, file_name, file_uri, file_size_bytes, encrypted, status, error_message, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    record.id,
    record.type,
    record.format,
    record.fileName ?? null,
    record.fileUri ?? null,
    record.fileSizeBytes ?? null,
    record.encrypted ? 1 : 0,
    record.status,
    record.errorMessage ?? null,
    record.createdAt,
  );

  return record;
}

export async function listBackupRecords(limit = 50) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BackupRecordRow>(
    'SELECT * FROM backup_records ORDER BY created_at DESC LIMIT ?',
    limit,
  );
  return rows.map(mapBackupRecord);
}
