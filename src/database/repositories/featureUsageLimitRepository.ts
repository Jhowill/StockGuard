import * as Crypto from 'expo-crypto';
import { getDatabase } from '../db';
import { withExclusiveTransaction } from '../db';
import type { PremiumFeature } from '@/types/ads';
import { dateKey, nowIso } from '@/utils/date';

type FeatureUsageLimitRow = {
  id: string;
  feature_key: PremiumFeature;
  date_key: string;
  period: 'daily' | 'monthly';
  used_count: number;
  free_limit: number;
  rewarded_limit: number;
  created_at: string;
  updated_at: string;
};

export type FeatureUsageLimitRecord = {
  id: string;
  featureKey: PremiumFeature;
  dateKey: string;
  period: 'daily' | 'monthly';
  usedCount: number;
  freeLimit: number;
  rewardedLimit: number;
  createdAt: string;
  updatedAt: string;
};

function mapRow(row: FeatureUsageLimitRow): FeatureUsageLimitRecord {
  return {
    id: row.id,
    featureKey: row.feature_key,
    dateKey: row.date_key,
    period: row.period,
    usedCount: row.used_count,
    freeLimit: row.free_limit,
    rewardedLimit: row.rewarded_limit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUsageLimit(featureKey: PremiumFeature, period: 'daily' | 'monthly' = 'daily') {
  const db = await getDatabase();
  const key = period === 'daily' ? dateKey() : dateKey().slice(0, 7);
  const row = await db.getFirstAsync<FeatureUsageLimitRow>(
    'SELECT * FROM feature_usage_limits WHERE feature_key = ? AND date_key = ? AND period = ?',
    featureKey,
    key,
    period,
  );
  return row ? mapRow(row) : null;
}

export async function saveUsageLimit(input: Omit<FeatureUsageLimitRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDatabase();
  const now = nowIso();
  const existing = await getUsageLimit(input.featureKey, input.period);
  const next: FeatureUsageLimitRecord = {
    id: existing?.id ?? Crypto.randomUUID(),
    featureKey: input.featureKey,
    dateKey: input.dateKey,
    period: input.period,
    usedCount: input.usedCount,
    freeLimit: input.freeLimit,
    rewardedLimit: input.rewardedLimit,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO feature_usage_limits (
      id, feature_key, date_key, period, used_count, free_limit, rewarded_limit, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(feature_key, date_key, period) DO UPDATE SET
      feature_key = excluded.feature_key,
      date_key = excluded.date_key,
      period = excluded.period,
      used_count = excluded.used_count,
      free_limit = excluded.free_limit,
      rewarded_limit = excluded.rewarded_limit,
      updated_at = excluded.updated_at`,
    next.id,
    next.featureKey,
    next.dateKey,
    next.period,
    next.usedCount,
    next.freeLimit,
    next.rewardedLimit,
    next.createdAt,
    next.updatedAt,
  );

  return next;
}

export async function incrementUsageLimit(featureKey: PremiumFeature, delta = 1, period: 'daily' | 'monthly' = 'daily') {
  if (!Number.isInteger(delta) || delta <= 0 || delta > 1_000) {
    throw new Error('INVALID_FEATURE_USAGE_DELTA');
  }
  const key = period === 'daily' ? dateKey() : dateKey().slice(0, 7);
  return withExclusiveTransaction(async (db) => {
    const now = nowIso();
    await db.runAsync(
      `INSERT INTO feature_usage_limits (
        id, feature_key, date_key, period, used_count, free_limit, rewarded_limit, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)
      ON CONFLICT(feature_key, date_key, period) DO UPDATE SET
        used_count = feature_usage_limits.used_count + excluded.used_count,
        updated_at = excluded.updated_at`,
      Crypto.randomUUID(),
      featureKey,
      key,
      period,
      delta,
      now,
      now,
    );
    const row = await db.getFirstAsync<FeatureUsageLimitRow>(
      'SELECT * FROM feature_usage_limits WHERE feature_key = ? AND date_key = ? AND period = ?',
      featureKey,
      key,
      period,
    );
    if (!row) throw new Error('FEATURE_USAGE_UPDATE_FAILED');
    return mapRow(row);
  });
}
