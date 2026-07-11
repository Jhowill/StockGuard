import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdPolicyNotice } from '@/components/ads/AdPolicyNotice';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PremiumLock } from '@/components/ui/PremiumLock';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdsAccess } from '@/hooks/useAdsAccess';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { useI18n } from '@/hooks/useI18n';
import { translateAppError } from '@/i18n/errorMessages';
import type { PremiumFeature } from '@/types/ads';

const features: Array<{ key: PremiumFeature; labelKey: string; descriptionKey: string }> = [
  { key: 'advanced_pdf_reports', labelKey: 'premium.advancedPdf', descriptionKey: 'premium.advancedPdfBody' },
  { key: 'csv_export', labelKey: 'premium.csvExport', descriptionKey: 'premium.csvExportBody' },
  { key: 'encrypted_backup', labelKey: 'premium.encryptedBackup', descriptionKey: 'premium.encryptedBackupBody' },
];

export default function PremiumScreen() {
  const { t } = useI18n();
  const { palette } = useAppTheme();
  const { grantFeatureUnlock, error: adsError } = useAdsAccess();
  const [selectedFeature, setSelectedFeature] = useState<PremiumFeature>('advanced_pdf_reports');
  const { state, refreshAccess, error: featureError } = useFeatureGate(selectedFeature);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();

  const handleFeatureUnlock = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    setActionError(undefined);
    try {
      const result = await grantFeatureUnlock(selectedFeature);
      if (result.status === 'failed') {
        setActionError(result.reason);
      }
      await refreshAccess(selectedFeature);
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : t('premium.featureFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title={t('premium.title')}
        subtitle={t('premium.subtitle')}
        variant="page"
        onBackPress={() => router.back()}
      />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="sparkles-outline" size={24} color={palette.premium} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>{t('premium.heroTitle')}</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('premium.heroBody')}</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone={state?.allowed ? 'success' : 'warning'} label={state?.allowed ? t('premium.unlocked') : t('premium.blocked')} />
        </View>
      </AppCard>

      <AdPolicyNotice title={t('ads.premiumTitle')} body={t('ads.premiumBody')} icon="ribbon-outline" tone="reward" />

      {actionError || adsError || featureError ? (
        <EmptyState title={t('premium.rewards')} description={translateAppError(actionError ?? adsError ?? featureError ?? t('premium.loadFailed'), t)} />
      ) : null}

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('premium.unlockFeature')}</AppCard.Title>
        <AppCard.Text>{t('premium.unlockFeatureBody')}</AppCard.Text>
        <View style={styles.featureGrid}>
          {features.map((feature) => (
            <AppCard
              key={feature.key}
              onPress={() => setSelectedFeature(feature.key)}
              variant={selectedFeature === feature.key ? 'hero' : 'default'}
              style={styles.featureCard}
            >
              <AppCard.Row
                icon="sparkles-outline"
                title={t(feature.labelKey)}
                subtitle={t(feature.descriptionKey)}
                trailing={<StatusBadge tone={selectedFeature === feature.key ? 'success' : 'info'} label={selectedFeature === feature.key ? t('premium.selected') : t('premium.choose')} />}
              />
            </AppCard>
          ))}
        </View>
        <StatusBadge tone={state?.allowed ? 'success' : 'warning'} label={state?.allowed ? t('premium.unlocked') : t('premium.blocked')} />
        <AppButton label={busy ? '...' : t('premium.watchUnlock')} variant="secondary" disabled={busy} onPress={() => void handleFeatureUnlock()} />
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 14,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    gap: 4,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureGrid: {
    gap: 10,
  },
  featureCard: {
    padding: 14,
  },
});
