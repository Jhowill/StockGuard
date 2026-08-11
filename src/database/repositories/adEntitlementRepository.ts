import * as Crypto from 'expo-crypto';
import { getDatabase, withExclusiveTransaction } from '../db';
import type { AdEntitlement, AdSource, AdEntitlementType, PremiumFeature } from '@/types/ads';
import { dateKey, localDateKey, nowIso } from '@/utils/date';

export const TEMPORARY_AD_FREE_DAILY_LIMIT = 3;

export type TemporaryAdFreeRewardState = {
  active: boolean;
  expiresAt?: string;
  dailyUseCount: number;
  dailyLimit: number;
};

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

export async function listAllEntitlements() {
  const db = await getDatabase();
  const rows = await db.getAllAsync<AdEntitlementRow>(
    'SELECT * FROM ad_entitlements ORDER BY created_at DESC',
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

function toTemporaryAdFreeRewardState(input: { entitlement?: AdEntitlement; dailyUseCount: number }): TemporaryAdFreeRewardState {
  return {
    active: Boolean(input.entitlement?.expiresAt),
    expiresAt: input.entitlement?.expiresAt,
    dailyUseCount: input.dailyUseCount,
    dailyLimit: TEMPORARY_AD_FREE_DAILY_LIMIT,
  };
}

export async function getTemporaryAdFreeRewardState() {
  await expireOldEntitlements();
  const db = await getDatabase();
  const dailyUseDate = localDateKey();
  const [activeRow, dailyCount] = await Promise.all([
    db.getFirstAsync<AdEntitlementRow>(
      `SELECT * FROM ad_entitlements
       WHERE type = 'temporary_ad_free' AND source = 'rewarded_ad' AND status = 'active'
         AND expires_at IS NOT NULL
       ORDER BY expires_at DESC LIMIT 1`,
    ),
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) AS count FROM ad_entitlements
       WHERE type = 'temporary_ad_free' AND source = 'rewarded_ad' AND daily_use_date = ?`,
      dailyUseDate,
    ),
  ]);

  return toTemporaryAdFreeRewardState({
    entitlement: activeRow ? mapEntitlement(activeRow) : undefined,
    dailyUseCount: dailyCount?.count ?? 0,
  });
}

export async function claimTemporaryAdFreeReward(durationMinutes: number) {
  return withExclusiveTransaction(async (db) => {
    const now = nowIso();
    const dailyUseDate = localDateKey();
    await db.runAsync(
      `UPDATE ad_entitlements
       SET status = 'expired', updated_at = ?
       WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < ?`,
      now,
      now,
    );

    const activeRow = await db.getFirstAsync<AdEntitlementRow>(
      `SELECT * FROM ad_entitlements
       WHERE type = 'temporary_ad_free' AND source = 'rewarded_ad' AND status = 'active'
         AND expires_at IS NOT NULL
       ORDER BY expires_at DESC LIMIT 1`,
    );
    const dailyCount = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) AS count FROM ad_entitlements
       WHERE type = 'temporary_ad_free' AND source = 'rewarded_ad' AND daily_use_date = ?`,
      dailyUseDate,
    );
    const used = dailyCount?.count ?? 0;

    if (activeRow) {
      return { granted: false, reason: 'AD_FREE_REWARD_ACTIVE' as const, state: toTemporaryAdFreeRewardState({ entitlement: mapEntitlement(activeRow), dailyUseCount: used }) };
    }
    if (used >= TEMPORARY_AD_FREE_DAILY_LIMIT) {
      return { granted: false, reason: 'AD_FREE_REWARD_LIMIT' as const, state: toTemporaryAdFreeRewardState({ dailyUseCount: used }) };
    }

    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    const entitlement: AdEntitlement = {
      id: Crypto.randomUUID(),
      type: 'temporary_ad_free',
      source: 'rewarded_ad',
      startedAt: now,
      expiresAt,
      dailyUseDate,
      dailyUseCount: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      `INSERT INTO ad_entitlements (
        id, type, source, feature_key, started_at, expires_at, remaining_uses,
        daily_use_date, daily_use_count, status, created_at, updated_at
      ) VALUES (?, ?, ?, NULL, ?, ?, NULL, ?, 0, 'active', ?, ?)`,
      entitlement.id,
      entitlement.type,
      entitlement.source,
      entitlement.startedAt,
      expiresAt,
      entitlement.dailyUseDate,
      entitlement.createdAt,
      entitlement.updatedAt,
    );

    return { granted: true, state: toTemporaryAdFreeRewardState({ entitlement, dailyUseCount: used + 1 }) };
  });
}

export async function consumeActiveEntitlementUse(featureKey: PremiumFeature) {
  return withExclusiveTransaction(async (db) => {
    const row = await db.getFirstAsync<AdEntitlementRow>(
      `SELECT * FROM ad_entitlements
       WHERE status = 'active' AND feature_key = ? AND remaining_uses > 0
       ORDER BY created_at DESC LIMIT 1`,
      featureKey,
    );
    if (!row) return null;

    const updatedAt = nowIso();
    const result = await db.runAsync(
      `UPDATE ad_entitlements
       SET remaining_uses = remaining_uses - 1,
           status = CASE WHEN remaining_uses - 1 > 0 THEN 'active' ELSE 'consumed' END,
           updated_at = ?
       WHERE id = ? AND status = 'active' AND remaining_uses > 0`,
      updatedAt,
      row.id,
    );
    if (result.changes !== 1) return null;
    const updated = await db.getFirstAsync<AdEntitlementRow>('SELECT * FROM ad_entitlements WHERE id = ?', row.id);
    return updated ? mapEntitlement(updated) : null;
  });
}
