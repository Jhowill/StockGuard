import Constants from 'expo-constants';

type AdsConfig = {
  enabled: boolean;
  testMode: boolean;
  androidAppId?: string;
  iosAppId?: string;
  androidRewardedId?: string;
  iosRewardedId?: string;
  androidRewardedInterstitialId?: string;
  iosRewardedInterstitialId?: string;
  androidBannerHomeId?: string;
  iosBannerHomeId?: string;
  androidBannerAlertsId?: string;
  iosBannerAlertsId?: string;
  androidNativeProductsId?: string;
  iosNativeProductsId?: string;
  androidNativeReportsId?: string;
  iosNativeReportsId?: string;
};

function readExtra(key: string) {
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const value = extra?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function getAdsConfig(): AdsConfig {
  const enabled = readExtra('EXPO_PUBLIC_ADS_ENABLED') === 'true';

  return {
    enabled,
    testMode: readExtra('EXPO_PUBLIC_ADS_TEST_MODE') === 'true',
    androidAppId: readExtra('EXPO_PUBLIC_ADMOB_ANDROID_APP_ID'),
    iosAppId: readExtra('EXPO_PUBLIC_ADMOB_IOS_APP_ID'),
    androidRewardedId: readExtra('EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID'),
    iosRewardedId: readExtra('EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID'),
    androidRewardedInterstitialId: readExtra('EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_INTERSTITIAL_ID'),
    iosRewardedInterstitialId: readExtra('EXPO_PUBLIC_ADMOB_IOS_REWARDED_INTERSTITIAL_ID'),
    androidBannerHomeId: readExtra('EXPO_PUBLIC_ADMOB_ANDROID_BANNER_HOME_ID'),
    iosBannerHomeId: readExtra('EXPO_PUBLIC_ADMOB_IOS_BANNER_HOME_ID'),
    androidBannerAlertsId: readExtra('EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ALERTS_ID'),
    iosBannerAlertsId: readExtra('EXPO_PUBLIC_ADMOB_IOS_BANNER_ALERTS_ID'),
    androidNativeProductsId: readExtra('EXPO_PUBLIC_ADMOB_ANDROID_NATIVE_PRODUCTS_ID'),
    iosNativeProductsId: readExtra('EXPO_PUBLIC_ADMOB_IOS_NATIVE_PRODUCTS_ID'),
    androidNativeReportsId: readExtra('EXPO_PUBLIC_ADMOB_ANDROID_NATIVE_REPORTS_ID'),
    iosNativeReportsId: readExtra('EXPO_PUBLIC_ADMOB_IOS_NATIVE_REPORTS_ID'),
  };
}

export type StandardAdPlacement = 'banner_home' | 'banner_alerts' | 'native_products' | 'native_reports';

export function getStandardAdUnitId(placement: StandardAdPlacement, platform: 'android' | 'ios') {
  const config = getAdsConfig();
  const ids = {
    banner_home: platform === 'android' ? config.androidBannerHomeId : config.iosBannerHomeId,
    banner_alerts: platform === 'android' ? config.androidBannerAlertsId : config.iosBannerAlertsId,
    native_products: platform === 'android' ? config.androidNativeProductsId : config.iosNativeProductsId,
    native_reports: platform === 'android' ? config.androidNativeReportsId : config.iosNativeReportsId,
  };
  return ids[placement];
}

export function getRewardedUnitId(platform: 'android' | 'ios') {
  const config = getAdsConfig();
  return platform === 'android' ? config.androidRewardedId : config.iosRewardedId;
}

export function getRewardedInterstitialUnitId(platform: 'android' | 'ios') {
  const config = getAdsConfig();
  return platform === 'android' ? config.androidRewardedInterstitialId : config.iosRewardedInterstitialId;
}

export function hasRewardedAdsConfig(platform?: 'android' | 'ios') {
  const config = getAdsConfig();
  if (!config.enabled) return false;
  if (platform) return Boolean(getRewardedUnitId(platform));
  return Boolean(config.androidRewardedId && config.iosRewardedId);
}

export function hasRewardedInterstitialConfig(platform?: 'android' | 'ios') {
  const config = getAdsConfig();
  if (!config.enabled) return false;
  if (platform) return Boolean(getRewardedInterstitialUnitId(platform));
  return Boolean(config.androidRewardedInterstitialId && config.iosRewardedInterstitialId);
}
