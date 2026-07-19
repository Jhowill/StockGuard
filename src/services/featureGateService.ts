import { featureDurations } from '@/constants/features';
import type { PremiumFeature } from '@/types/ads';
import { findActiveEntitlements, expireOldEntitlements } from '@/database/repositories/adEntitlementRepository';
import { getUsageLimit } from '@/database/repositories/featureUsageLimitRepository';

export type FeatureAccessState = {
  featureKey: PremiumFeature;
  allowed: boolean;
  source: 'free' | 'rewarded_ad' | 'premium' | 'blocked';
  expiresAt?: string;
  remainingUses?: number;
  reason?: 'limit_reached' | 'requires_reward' | 'expired' | 'offline_required_ad';
};

export async function getFeatureAccessState(featureKey: PremiumFeature): Promise<FeatureAccessState> {
  await expireOldEntitlements();

  const activeEntitlements = await findActiveEntitlements();
  const entitlement = activeEntitlements.find((item) => item.featureKey === featureKey);

  const usage = await getUsageLimit(featureKey);
  const featureConfig = featureDurations[featureKey];
  const freeLimit = featureConfig.freeLimit ?? 0;

  if (freeLimit > 0 && (usage?.usedCount ?? 0) < freeLimit) {
    return {
      featureKey,
      allowed: true,
      source: 'free',
      remainingUses: freeLimit - (usage?.usedCount ?? 0),
    };
  }

  if (entitlement?.expiresAt) {
    return {
      featureKey,
      allowed: true,
      source: 'rewarded_ad',
      expiresAt: entitlement.expiresAt,
      remainingUses: entitlement.remainingUses,
    };
  }

  const remainingUses = entitlement?.remainingUses ?? 0;
  if (remainingUses > 0) {
    return {
      featureKey,
      allowed: true,
      source: 'rewarded_ad',
      remainingUses,
    };
  }

  return {
    featureKey,
    allowed: false,
    source: 'blocked',
    reason: 'requires_reward',
  };
}

export async function canUseFeature(featureKey: PremiumFeature) {
  const state = await getFeatureAccessState(featureKey);
  return state.allowed;
}
