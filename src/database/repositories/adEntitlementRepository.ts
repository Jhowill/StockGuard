import * as Crypto from 'expo-crypto';
import { getDatabase } from '../db';
import type { AdEntitlement, AdSource, AdEntitlementType, PremiumFeature } from '@/types/ads';
import { dateKey, nowIso } from '@/utils/date';

type AdEntitlementRow = {
  id: string;
  type: AdEntitlementType;
  source: AdSource;
  feature_key: PremiumFeature | null;
  started_at: string;
  expires_at: string | null;
  remaining_uses: number | null;
  daily_use_date: string;
  daily_use_count: number;
  status: AdEntitlement['status'];
  created_at: string;
  updated_at: string;
};

function mapEntitlement(row: AdEntitlementRow): AdEntitlement {
  return {
    id: row.id,
    type: row.type,
    source: row.source,
    featureKey: row.feature_key ?? undefined,
    startedAt: row.started_at,
    expiresAt: row.expires_at ?? undefined,
    remainingUses: row.remaining_uses ?? undefined,
    dailyUseDate: row.daily_use_date,
    dailyUseCount: row.daily_use_count,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createEntitlement(input: {
  type: AdEntitlementType;
  source: AdSource;
  featureKey?: PremiumFeature;
  expiresAt?: string;
  remainingUses?: number;
}) {
  const db = await getDatabase();
  const now = nowIso();
  const entitlement: AdEntitlement = {
    id: Crypto.randomUUID(),
    type: input.type,
    source: input.source,
    featureKey: input.featureKey,
    startedAt: now,
    expiresAt: input.expiresAt,
    remainingUses: input.remainingUses,
    dailyUseDate: dateKey(),
    dailyUseCount: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO ad_entitlements (
      id, type, source, feature_key, started_at, expires_at, remaining_uses,
      daily_use_date, daily_use_count, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    entitlement.id,
    entitlement.type,
    entitlement.source,
    entitlement.featureKey ?? null,
    entitlement.startedAt,
    entitlement.expiresAt ?? null,
    entitlement.remainingUses ?? null,
    entitlement.dailyUseDate,
    entitlement.dailyUseCount,
    entitlement.status,
    entitlement.createdAt,
    entitlement.updatedAt,
  );

  return entitlement;
}

export async function findActiveEntitlements() {
  const db = await getDatabase();
  const rows = await db.getAllAsync<AdEntitlementRow>(
    'SELECT * FROM ad_entitlements WHERE status = "active" ORDER BY created_at DESC',
  );
  return rows.map(mapEntitlement);
}

export async function expireOldEntitlements() {
  const db = await getDatabase();
  const now = nowIso();
  await db.runAsync(
    `UPDATE ad_entitlements
     SET status = "expired", updated_at = ?
     WHERE status = "active" AND expires_at IS NOT NULL AND expires_at < ?`,
    now,
    now,
  );
}
