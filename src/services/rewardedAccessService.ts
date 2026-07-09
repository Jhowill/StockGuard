import { featureDurations } from '@/constants/features';
import { createEntitlement, expireOldEntitlements } from '@/database/repositories/adEntitlementRepository';
import { incrementUsageLimit } from '@/database/repositories/featureUsageLimitRepository';
import type { PremiumFeature } from '@/types/ads';
import { nowIso } from '@/utils/date';
import { dateKey } from '@/utils/date';

export async function grantTemporaryAdFree(durationMinutes = 60) {
  await expireOldEntitlements();
  return createEntitlement({
    type: 'temporary_ad_free',
    source: 'rewarded_ad',
    expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
  });
}

export async function grantFeatureUnlock(featureKey: PremiumFeature) {
  await expireOldEntitlements();
  const config = featureDurations[featureKey];
  const expiresAt = config.days ? new Date(Date.now() + config.days * 24 * 60 * 60 * 1000).toISOString() : undefined;
  const remainingUses = config.uses ?? undefined;
  const entitlement = await createEntitlement({
    type: remainingUses ? 'usage_feature_unlock' : 'temporary_feature_unlock',
    source: 'rewarded_interstitial',
    featureKey,
    expiresAt,
    remainingUses,
  });

  await incrementUsageLimit(featureKey, 1);
  return entitlement;
}

export async function consumeFeatureUse(featureKey: PremiumFeature) {
  const next = await incrementUsageLimit(featureKey, 1);
  return next;
}

export async function touchRewardUse() {
  return nowIso();
}

export async function currentRewardDay() {
  return dateKey();
}
