import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeAd } from 'react-native-google-mobile-ads';
import { getAdsConfig, getStandardAdUnitId, type StandardAdPlacement } from '@/config/ads';
import { useAdsAccess } from '@/hooks/useAdsAccess';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { prepareAdsForDisplay } from '@/services/adsService';

type MobileAdsModule = typeof import('react-native-google-mobile-ads');
declare const require: (moduleName: string) => unknown;

type Props = {
  placement: Extract<StandardAdPlacement, 'native_products' | 'native_reports'>;
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

export function StandardNativeAd({ placement }: Props) {
  const { palette } = useAppTheme();
  const { language, t } = useI18n();
  const { isTemporaryAdFree, loading } = useAdsAccess();
  const [prepared, setPrepared] = useState(false);
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const config = getAdsConfig();
  const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : undefined;
  const ads = prepared ? loadMobileAds() : null;
  const unitId = ads && platform ? (config.testMode ? ads.TestIds.NATIVE : getStandardAdUnitId(placement, platform)) : undefined;

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

  useEffect(() => {
    let cancelled = false;
    let loadedAd: NativeAd | null = null;

    if (!ads || !unitId || !config.enabled || loading || isTemporaryAdFree) {
      setNativeAd((current) => {
        current?.destroy();
        return null;
      });
      return undefined;
    }

    void ads.NativeAd.createForAdRequest(unitId, { requestNonPersonalizedAdsOnly: false })
      .then((nextAd) => {
        loadedAd = nextAd;
        if (cancelled) {
          nextAd.destroy();
          return;
        }
        setNativeAd((current) => {
          current?.destroy();
          return nextAd;
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      loadedAd?.destroy();
    };
  }, [ads, config.enabled, isTemporaryAdFree, loading, unitId]);

  if (!ads || !nativeAd || isTemporaryAdFree) {
    return null;
  }

  return (
    <ads.NativeAdView nativeAd={nativeAd} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]} accessibilityLabel={t('common.advertisement')}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: palette.textMuted }]}>{t('common.advertisement').toLocaleUpperCase(language)}</Text>
        {nativeAd.icon?.url ? (
          <ads.NativeAsset assetType={ads.NativeAssetType.ICON}>
            <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
          </ads.NativeAsset>
        ) : null}
      </View>
      <ads.NativeAsset assetType={ads.NativeAssetType.HEADLINE}>
        <Text style={[styles.headline, { color: palette.text }]}>{nativeAd.headline}</Text>
      </ads.NativeAsset>
      <ads.NativeAsset assetType={ads.NativeAssetType.BODY}>
        <Text style={[styles.body, { color: palette.textMuted }]}>{nativeAd.body}</Text>
      </ads.NativeAsset>
      <ads.NativeAsset assetType={ads.NativeAssetType.CALL_TO_ACTION}>
        <View style={[styles.cta, { backgroundColor: palette.primary }]}>
          <Text style={{ color: palette.primaryText }}>{nativeAd.callToAction}</Text>
        </View>
      </ads.NativeAsset>
    </ads.NativeAdView>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: 16, borderRadius: 18, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  icon: { width: 28, height: 28, borderRadius: 6 },
  headline: { fontSize: 16, fontWeight: '800' },
  body: { fontSize: 13, lineHeight: 18 },
  cta: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
});
