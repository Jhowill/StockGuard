import { useCallback, useEffect, useState } from 'react';
import { findActiveEntitlements } from '@/database/repositories/adEntitlementRepository';
import type { PremiumFeature } from '@/types/ads';
import { showRewardedAd, showRewardedInterstitial } from '@/services/adsService';
import { grantFeatureUnlock, grantTemporaryAdFree } from '@/services/rewardedAccessService';

export function useAdsAccess() {
  const [isTemporaryAdFree, setIsTemporaryAdFree] = useState(false);
  const [adFreeExpiresAt, setAdFreeExpiresAt] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const active = await findActiveEntitlements();
      const adFree = active.find((item) => item.type === 'temporary_ad_free' && item.expiresAt);
      setIsTemporaryAdFree(Boolean(adFree));
      setAdFreeExpiresAt(adFree?.expiresAt);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const canRequestAdFreeReward = !isTemporaryAdFree;

  const grantAdFree = useCallback(async () => {
    const adResult = await showRewardedAd('temporary_ad_free');
    if (adResult.status !== 'success') {
      return adResult;
    }

    const entitlement = await grantTemporaryAdFree();
    setIsTemporaryAdFree(true);
    setAdFreeExpiresAt(entitlement.expiresAt);
    return adResult;
  }, []);

  const unlockFeature = useCallback(async (featureKey: PremiumFeature) => {
    const adResult = await showRewardedInterstitial(featureKey);
    if (adResult.status !== 'success') {
      return adResult;
    }

    await grantFeatureUnlock(featureKey);
    return adResult;
  }, []);

  return {
    loading,
    isTemporaryAdFree,
    adFreeExpiresAt,
    canRequestAdFreeReward,
    refresh,
    grantTemporaryAdFree: grantAdFree,
    grantFeatureUnlock: unlockFeature,
  };
}
