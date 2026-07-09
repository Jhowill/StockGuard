import Constants from 'expo-constants';

type AdsConfig = {
  enabled: boolean;
  androidAppId?: string;
  iosAppId?: string;
  androidRewardedId?: string;
  iosRewardedId?: string;
  androidRewardedInterstitialId?: string;
  iosRewardedInterstitialId?: string;
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
    androidAppId: readExtra('EXPO_PUBLIC_ADMOB_ANDROID_APP_ID'),
    iosAppId: readExtra('EXPO_PUBLIC_ADMOB_IOS_APP_ID'),
    androidRewardedId: readExtra('EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID'),
    iosRewardedId: readExtra('EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID'),
    androidRewardedInterstitialId: readExtra('EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_INTERSTITIAL_ID'),
    iosRewardedInterstitialId: readExtra('EXPO_PUBLIC_ADMOB_IOS_REWARDED_INTERSTITIAL_ID'),
  };
}

export function hasRewardedAdsConfig() {
  const config = getAdsConfig();
  return Boolean(config.enabled && (config.androidRewardedId || config.iosRewardedId));
}

export function hasRewardedInterstitialConfig() {
  const config = getAdsConfig();
  return Boolean(config.enabled && (config.androidRewardedInterstitialId || config.iosRewardedInterstitialId));
}
