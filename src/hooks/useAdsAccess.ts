import { useCallback, useEffect, useRef, useState } from 'react';
import type { PremiumFeature } from '@/types/ads';
import { preloadRewardedAds, showRewardedAd, showRewardedInterstitial } from '@/services/adsService';
import { getTemporaryAdFreeState, grantFeatureUnlock, grantTemporaryAdFree, subscribeAdAccess } from '@/services/rewardedAccessService';

export function useAdsAccess() {
  const [isTemporaryAdFree, setIsTemporaryAdFree] = useState(false);
  const [adFreeExpiresAt, setAdFreeExpiresAt] = useState<string | undefined>();
  const [dailyAdFreeUses, setDailyAdFreeUses] = useState(0);
  const [dailyAdFreeLimit, setDailyAdFreeLimit] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(undefined);
    try {
      const state = await getTemporaryAdFreeState();
      if (requestId !== requestIdRef.current) {
        return;
      }
      setIsTemporaryAdFree(state.active);
      setAdFreeExpiresAt(state.expiresAt);
      setDailyAdFreeUses(state.dailyUseCount);
      setDailyAdFreeLimit(state.dailyLimit);
    } catch (nextError) {
      if (requestId === requestIdRef.current) {
        setError(nextError instanceof Error ? nextError.message : 'ADS_ACCESS_LOAD_FAILED');
        setIsTemporaryAdFree(false);
        setAdFreeExpiresAt(undefined);
        setDailyAdFreeUses(0);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
    void preloadRewardedAds().catch(() => undefined);
    const unsubscribe = subscribeAdAccess(() => void refresh());
    return () => {
      unsubscribe();
      requestIdRef.current += 1;
    };
  }, [refresh]);

  useEffect(() => {
    if (!isTemporaryAdFree || !adFreeExpiresAt) return undefined;
    const remainingMs = new Date(adFreeExpiresAt).getTime() - Date.now();
    const timeout = setTimeout(() => void refresh(), Math.max(250, remainingMs + 250));
    return () => clearTimeout(timeout);
  }, [adFreeExpiresAt, isTemporaryAdFree, refresh]);

  const canRequestAdFreeReward = !isTemporaryAdFree && dailyAdFreeUses < dailyAdFreeLimit;

  const grantAdFree = useCallback(async () => {
    const eligibility = await getTemporaryAdFreeState();
    if (eligibility.active) {
      return { status: 'failed' as const, reason: 'AD_FREE_REWARD_ACTIVE' };
    }
    if (eligibility.dailyUseCount >= eligibility.dailyLimit) {
      return { status: 'failed' as const, reason: 'AD_FREE_REWARD_LIMIT' };
    }

    const adResult = await showRewardedAd('temporary_ad_free');
    if (adResult.status !== 'success') {
      return adResult;
    }

    const reward = await grantTemporaryAdFree();
    if (!reward.granted) {
      return { status: 'failed' as const, reason: reward.reason };
    }

    setIsTemporaryAdFree(reward.state.active);
    setAdFreeExpiresAt(reward.state.expiresAt);
    setDailyAdFreeUses(reward.state.dailyUseCount);
    setDailyAdFreeLimit(reward.state.dailyLimit);
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
    error,
    isTemporaryAdFree,
    adFreeExpiresAt,
    dailyAdFreeUses,
    dailyAdFreeLimit,
    canRequestAdFreeReward,
    refresh,
    grantTemporaryAdFree: grantAdFree,
    grantFeatureUnlock: unlockFeature,
  };
}
