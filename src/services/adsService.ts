import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { InterstitialAd } from 'react-native-google-mobile-ads';
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
import {
  claimInterstitialDisplay,
  releaseInterstitialDisplayClaim,
} from '@/database/repositories/adDisplayRepository';

export type RewardedAdResult =
  | { status: 'success'; rewardType: 'temporary_ad_free' | 'feature_unlock' }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string };

type RewardedAdType = 'temporary_ad_free' | 'feature_unlock';
type MobileAdsModule = typeof import('react-native-google-mobile-ads');
declare const require: (moduleName: string) => unknown;

const LOAD_TIMEOUT_MS = 20_000;
let initializationPromise: Promise<MobileAdsModule> | null = null;
let standardInterstitial: InterstitialAd | null = null;
let standardInterstitialLoaded = false;

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

    await ads.default().initialize();
    return ads;
  })().catch((error) => {
    initializationPromise = null;
    throw error;
  });

  return initializationPromise;
}

function errorCode(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'ADS_UNAVAILABLE';
}

async function showAd(kind: 'rewarded' | 'rewardedInterstitial', rewardType: RewardedAdType): Promise<RewardedAdResult> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return { status: 'failed', reason: 'ADS_PLATFORM_UNSUPPORTED' };
  }

  try {
    const ads = await initializeAds();
    const config = getAdsConfig();
    const platform = Platform.OS;
    const configuredUnitId = kind === 'rewarded'
      ? getRewardedUnitId(platform)
      : getRewardedInterstitialUnitId(platform);
    const testUnitId = kind === 'rewarded' ? ads.TestIds.REWARDED : ads.TestIds.REWARDED_INTERSTITIAL;
    const unitId = config.testMode ? testUnitId : configuredUnitId;

    if (!unitId) {
      return { status: 'failed', reason: 'ADS_NOT_CONFIGURED' };
    }

    const advert = kind === 'rewarded'
      ? ads.RewardedAd.createForAdRequest(unitId, { requestNonPersonalizedAdsOnly: false })
      : ads.RewardedInterstitialAd.createForAdRequest(unitId, { requestNonPersonalizedAdsOnly: false });

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
      };
      const timeout = setTimeout(() => finish({ status: 'failed', reason: 'ADS_LOAD_TIMEOUT' }), LOAD_TIMEOUT_MS);

      subscriptions.push(
        advert.addAdEventListener(ads.RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        }),
        advert.addAdEventListener(ads.AdEventType.CLOSED, () => {
          finish(earned ? { status: 'success', rewardType } : { status: 'cancelled' });
        }),
        advert.addAdEventListener(ads.AdEventType.ERROR, (error) => {
          finish({ status: 'failed', reason: errorCode(error) });
        }),
        advert.addAdEventListener(ads.RewardedAdEventType.LOADED, () => {
          void advert.show().catch((error) => finish({ status: 'failed', reason: errorCode(error) }));
        }),
      );

      advert.load();
    });
  } catch (error) {
    return { status: 'failed', reason: errorCode(error) };
  }
}

export async function showRewardedAd(rewardType: RewardedAdType): Promise<RewardedAdResult> {
  if (!hasRewardedAdsConfig()) {
    return { status: 'failed', reason: 'ADS_NOT_CONFIGURED' };
  }
  return showAd('rewarded', rewardType);
}

export async function showRewardedInterstitial(_featureKey: string): Promise<RewardedAdResult> {
  if (!hasRewardedInterstitialConfig()) {
    return { status: 'failed', reason: 'ADS_NOT_CONFIGURED' };
  }
  return showAd('rewardedInterstitial', 'feature_unlock');
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

export async function preloadStandardInterstitial() {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios' || standardInterstitial || !(await canShowStandardAds())) {
    return;
  }

  const ads = await initializeAds();
  const config = getAdsConfig();
  const unitId = config.testMode ? ads.TestIds.INTERSTITIAL : getStandardAdUnitId('interstitial_transition', Platform.OS);
  if (!unitId) {
    return;
  }

  const advert = ads.InterstitialAd.createForAdRequest(unitId, { requestNonPersonalizedAdsOnly: false });
  standardInterstitial = advert;
  advert.addAdEventListener(ads.AdEventType.LOADED, () => {
    standardInterstitialLoaded = true;
  });
  advert.addAdEventListener(ads.AdEventType.CLOSED, () => {
    standardInterstitial = null;
    standardInterstitialLoaded = false;
    void preloadStandardInterstitial().catch(() => undefined);
  });
  advert.addAdEventListener(ads.AdEventType.ERROR, () => {
    standardInterstitial = null;
    standardInterstitialLoaded = false;
  });
  advert.load();
}

export async function showStandardInterstitialAtTransition() {
  if (!standardInterstitial || !standardInterstitialLoaded || !(await canShowStandardAds())) {
    return false;
  }
  const claim = await claimInterstitialDisplay();
  if (!claim.allowed) {
    return false;
  }

  try {
    await standardInterstitial.show();
    return true;
  } catch {
    await releaseInterstitialDisplayClaim(claim.eventId).catch(() => undefined);
    standardInterstitial = null;
    standardInterstitialLoaded = false;
    void preloadStandardInterstitial().catch(() => undefined);
    return false;
  }
}

export async function showPrivacyOptions() {
  const ads = await initializeAds();
  return ads.AdsConsent.showPrivacyOptionsForm();
}
