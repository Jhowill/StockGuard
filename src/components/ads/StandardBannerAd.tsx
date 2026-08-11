import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { getAdsConfig, getStandardAdUnitId, type StandardAdPlacement } from '@/config/ads';
import { useAdsAccess } from '@/hooks/useAdsAccess';
import { useI18n } from '@/hooks/useI18n';
import { prepareAdsForDisplay } from '@/services/adsService';

type MobileAdsModule = typeof import('react-native-google-mobile-ads');
declare const require: (moduleName: string) => unknown;

type Props = {
  placement: Extract<StandardAdPlacement, 'banner_home' | 'banner_alerts'>;
};

function loadMobileAds(): MobileAdsModule | null {
  if (Constants.appOwnership === 'expo') {
    return null;
  }
  try {
    return require('react-native-google-mobile-ads') as MobileAdsModule;
  } catch {
    return null;
  }
}

export function StandardBannerAd({ placement }: Props) {
  const { isTemporaryAdFree, loading } = useAdsAccess();
  const { t } = useI18n();
  const [prepared, setPrepared] = useState(false);
  const config = getAdsConfig();
  const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : undefined;
  const ads = prepared ? loadMobileAds() : null;
  const unitId = ads && platform ? (config.testMode ? ads.TestIds.ADAPTIVE_BANNER : getStandardAdUnitId(placement, platform)) : undefined;

  useEffect(() => {
    let active = true;

    if (!config.enabled || loading || isTemporaryAdFree || !platform) {
      setPrepared(false);
      return () => {
        active = false;
      };
    }

    void prepareAdsForDisplay().then((ready) => {
      if (active) setPrepared(ready);
    });

    return () => {
      active = false;
    };
  }, [config.enabled, isTemporaryAdFree, loading, platform]);

  if (!prepared || !ads || !platform || !config.enabled || loading || isTemporaryAdFree || !unitId) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityLabel={t('common.advertisement')}>
      <ads.BannerAd
        unitId={unitId}
        size={ads.BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minHeight: 1,
  },
});
