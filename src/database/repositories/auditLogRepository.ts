import * as Crypto from 'expo-crypto';
import { getDatabase } from '../db';
import type { AuditAction, AuditLog } from '@/types/audit';

export async function createAuditLog(input: Omit<AuditLog, 'id' | 'createdAt'> & { createdAt?: string }) {
  const db = await getDatabase();
  const createdAt = input.createdAt ?? new Date().toISOString();
  const id = Crypto.randomUUID();

  await db.runAsync(
    `INSERT INTO audit_logs (id, action, entity_type, entity_id, metadata_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    input.action,
    input.entityType ?? null,
    input.entityId ?? null,
    input.metadataJson ?? null,
    createdAt,
  );

  return { id, ...input, createdAt } satisfies AuditLog;
}

export async function findRecentAuditLogs(limit = 50) {
  const db = await getDatabase();
  return db.getAllAsync<AuditLog>(
    `SELECT id, action, entity_type as entityType, entity_id as entityId, metadata_json as metadataJson, created_at as createdAt
     FROM audit_logs ORDER BY created_at DESC LIMIT ?`,
    limit,
  );
}
