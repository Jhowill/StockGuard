import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { RewardedAd, RewardedInterstitialAd } from 'react-native-google-mobile-ads';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import {
  getAdsConfig,
  getRewardedInterstitialUnitId,
  getRewardedUnitId,
  getStandardAdUnitId,
  hasRewardedAdsConfig,
  hasRewardedInterstitialConfig,
} from '@/config/ads';
import { getTemporaryAdFreeState } from '@/services/rewardedAccessService';

export type RewardedAdResult =
  | {
      status: 'success';
      rewardType: 'temporary_ad_free' | 'feature_unlock';
      source: 'ad' | 'availability_fallback';
    }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string };

type RewardedAdType = 'temporary_ad_free' | 'feature_unlock';
type RewardedKind = 'rewarded' | 'rewardedInterstitial';
type RewardedAdvert = RewardedAd | RewardedInterstitialAd;
type MobileAdsModule = typeof import('react-native-google-mobile-ads');
declare const require: (moduleName: string) => unknown;

const LOAD_TIMEOUT_MS = 12_000;
const SHOW_TIMEOUT_MS = 5 * 60_000;
const CACHE_MAX_AGE_MS = 55 * 60_000;
let initializationPromise: Promise<MobileAdsModule> | null = null;
let rewardedFlowActive = false;
const rewardedCache: Partial<Record<RewardedKind, { advert: RewardedAdvert; loadedAt: number }>> = {};
const rewardedLoadPromises: Partial<Record<RewardedKind, Promise<RewardedAdvert>>> = {};

function loadNativeModule() {
  // Expo Go does not include the AdMob native module. A development or store build is required.
  if (Constants.appOwnership === 'expo') {
    throw new Error('ADS_NATIVE_MODULE_UNAVAILABLE');
  }

  return require('react-native-google-mobile-ads') as MobileAdsModule;
}

async function initializeAds() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const ads = loadNativeModule();
    await ads.AdsConsent.requestInfoUpdate();
    const finalConsent = await ads.AdsConsent.loadAndShowConsentFormIfRequired();

    if (!finalConsent.canRequestAds) {
      throw new Error('ADS_CONSENT_REQUIRED');
    }

    if (Platform.OS === 'ios') {
      const tracking = await getTrackingPermissionsAsync();
      if (tracking.status === 'undetermined') {
        await requestTrackingPermissionsAsync();
      }
    }

    await ads.default().setRequestConfiguration({
      maxAdContentRating: ads.MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    await ads.default().initialize();
    return ads;
  })().catch((error) => {
    initializationPromise = null;
    throw error;
  });

  return initializationPromise;
}

function errorCode(error: unknown) {
  const nativeCode = typeof error === 'object' && error && 'code' in error
    ? String(error.code).toLowerCase()
    : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  const value = `${nativeCode} ${message}`;

  if (value.includes('no-fill') || value.includes('no fill')) return 'ADS_NO_FILL';
  if (value.includes('network')) return 'ADS_NETWORK_ERROR';
  if (value.includes('invalid-request') || value.includes('invalid request')) return 'ADS_INVALID_REQUEST';
  if (value.includes('internal-error') || value.includes('internal error')) return 'ADS_INTERNAL_ERROR';
  if (value.includes('already-used') || value.includes('already used') || value.includes('ad-reused')) return 'ADS_ALREADY_USED';
  if (error instanceof Error && /^ADS_[A-Z_]+$/.test(error.message)) {
    return error.message;
  }
  return 'ADS_UNAVAILABLE';
}

function getPlatform() {
  return Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : undefined;
}

function getUnitId(ads: MobileAdsModule, kind: RewardedKind) {
  const platform = getPlatform();
  if (!platform) return undefined;
  const config = getAdsConfig();
  if (config.testMode) {
    return kind === 'rewarded' ? ads.TestIds.REWARDED : ads.TestIds.REWARDED_INTERSTITIAL;
  }
  return kind === 'rewarded' ? getRewardedUnitId(platform) : getRewardedInterstitialUnitId(platform);
}

function clearCachedRewarded(kind: RewardedKind) {
  delete rewardedCache[kind];
}

async function loadRewarded(kind: RewardedKind, force = false): Promise<RewardedAdvert> {
  const cached = rewardedCache[kind];
  if (!force && cached && Date.now() - cached.loadedAt < CACHE_MAX_AGE_MS && cached.advert.loaded) {
    return cached.advert;
  }
  clearCachedRewarded(kind);

  const pending = rewardedLoadPromises[kind];
  if (pending) return pending;

  const loadPromise = (async () => {
    const ads = await initializeAds();
    const unitId = getUnitId(ads, kind);
    if (!unitId) throw new Error('ADS_NOT_CONFIGURED');

    const advert: RewardedAdvert = kind === 'rewarded'
      ? ads.RewardedAd.createForAdRequest(unitId, { requestNonPersonalizedAdsOnly: false })
      : ads.RewardedInterstitialAd.createForAdRequest(unitId, { requestNonPersonalizedAdsOnly: false });

    return await new Promise<RewardedAdvert>((resolve, reject) => {
      let settled = false;
      const subscriptions: Array<() => void> = [];
      const finish = (result?: RewardedAdvert, error?: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        subscriptions.forEach((unsubscribe) => unsubscribe());
        if (result) resolve(result);
        else reject(error instanceof Error ? error : new Error(errorCode(error)));
      };
      const timeout = setTimeout(() => finish(undefined, new Error('ADS_LOAD_TIMEOUT')), LOAD_TIMEOUT_MS);

      subscriptions.push(
        advert.addAdEventListener(ads.RewardedAdEventType.LOADED, () => finish(advert)),
        advert.addAdEventListener(ads.AdEventType.ERROR, (error) => finish(undefined, new Error(errorCode(error)))),
      );

      try {
        advert.load();
      } catch (error) {
        finish(undefined, error);
      }
    });
  })();

  rewardedLoadPromises[kind] = loadPromise;
  try {
    const advert = await loadPromise;
    rewardedCache[kind] = { advert, loadedAt: Date.now() };
    return advert;
  } finally {
    delete rewardedLoadPromises[kind];
  }
}

async function showLoadedRewarded(kind: RewardedKind, rewardType: RewardedAdType): Promise<RewardedAdResult> {
  try {
    const ads = await initializeAds();
    const advert = await loadRewarded(kind);
    clearCachedRewarded(kind);

    return await new Promise<RewardedAdResult>((resolve) => {
      let earned = false;
      let settled = false;
      const subscriptions: Array<() => void> = [];
      const finish = (result: RewardedAdResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        subscriptions.forEach((unsubscribe) => unsubscribe());
        resolve(result);
        void loadRewarded(kind, true).catch(() => undefined);
      };
      const timeout = setTimeout(() => finish({ status: 'failed', reason: 'ADS_UNAVAILABLE' }), SHOW_TIMEOUT_MS);

      subscriptions.push(
        advert.addAdEventListener(ads.RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        }),
        advert.addAdEventListener(ads.AdEventType.CLOSED, () => {
          finish(earned ? { status: 'success', rewardType, source: 'ad' } : { status: 'cancelled' });
        }),
        advert.addAdEventListener(ads.AdEventType.ERROR, (error) => {
          finish({ status: 'failed', reason: errorCode(error) });
        }),
      );

      void advert.show().catch((error) => finish({ status: 'failed', reason: errorCode(error) }));
    });
  } catch (error) {
    return { status: 'failed', reason: errorCode(error) };
  }
}

function isAvailabilityFailure(result: RewardedAdResult) {
  return result.status === 'failed' && [
    'ADS_NO_FILL',
    'ADS_NETWORK_ERROR',
    'ADS_LOAD_TIMEOUT',
    'ADS_INTERNAL_ERROR',
    'ADS_UNAVAILABLE',
    'ADS_ALREADY_USED',
  ].includes(result.reason);
}

async function runRewardedFlow(kind: RewardedKind, rewardType: RewardedAdType): Promise<RewardedAdResult> {
  if (rewardedFlowActive) {
    return { status: 'failed', reason: 'ADS_ALREADY_IN_PROGRESS' };
  }

  rewardedFlowActive = true;
  try {
    const primary = await showLoadedRewarded(kind, rewardType);
    if (primary.status !== 'failed' || !isAvailabilityFailure(primary)) return primary;

    const platform = getPlatform();
    const fallbackKind: RewardedKind = kind === 'rewarded' ? 'rewardedInterstitial' : 'rewarded';
    const fallbackConfigured = fallbackKind === 'rewarded'
      ? hasRewardedAdsConfig(platform)
      : hasRewardedInterstitialConfig(platform);
    if (fallbackConfigured) {
      const fallback = await showLoadedRewarded(fallbackKind, rewardType);
      if (fallback.status !== 'failed' || !isAvailabilityFailure(fallback)) return fallback;
    }

    // An external ad outage must not leave an offline-first app looking frozen.
    return { status: 'success', rewardType, source: 'availability_fallback' };
  } finally {
    rewardedFlowActive = false;
  }
}

export async function preloadRewardedAds() {
  const platform = getPlatform();
  if (!platform || !getAdsConfig().enabled) return false;

  const kinds: RewardedKind[] = [];
  if (hasRewardedAdsConfig(platform)) kinds.push('rewarded');
  if (hasRewardedInterstitialConfig(platform)) kinds.push('rewardedInterstitial');
  const results = await Promise.allSettled(kinds.map((kind) => loadRewarded(kind)));
  return results.some((result) => result.status === 'fulfilled');
}

export async function showRewardedAd(rewardType: RewardedAdType): Promise<RewardedAdResult> {
  const platform = getPlatform();
  if (!platform) return { status: 'failed', reason: 'ADS_PLATFORM_UNSUPPORTED' };
  if (!hasRewardedAdsConfig(platform)) {
    return { status: 'failed', reason: 'ADS_NOT_CONFIGURED' };
  }
  return runRewardedFlow('rewarded', rewardType);
}

export async function showRewardedInterstitial(_featureKey: string): Promise<RewardedAdResult> {
  const platform = getPlatform();
  if (!platform) return { status: 'failed', reason: 'ADS_PLATFORM_UNSUPPORTED' };
  if (!hasRewardedInterstitialConfig(platform)) {
    return { status: 'failed', reason: 'ADS_NOT_CONFIGURED' };
  }
  return runRewardedFlow('rewardedInterstitial', 'feature_unlock');
}

export async function canShowStandardAds() {
  if (!getAdsConfig().enabled) {
    return false;
  }

  // Feature-unlock rewarded ads intentionally bypass this check.
  const adFree = await getTemporaryAdFreeState();
  return !adFree.active;
}

export async function prepareAdsForDisplay() {
  if (
    (Platform.OS !== 'android' && Platform.OS !== 'ios')
    || !getAdsConfig().enabled
    || !(await canShowStandardAds())
  ) {
    return false;
  }

  try {
    await initializeAds();
    return true;
  } catch {
    return false;
  }
}

export async function showPrivacyOptions() {
  const ads = await initializeAds();
  return ads.AdsConsent.showPrivacyOptionsForm();
}
