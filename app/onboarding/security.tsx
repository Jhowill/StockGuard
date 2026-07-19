import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { translateAppError } from '@/i18n/errorMessages';
import { useAppState } from '@/state/app-state';
import { useSettings } from '@/hooks/useSettings';

export default function SecurityScreen() {
  const { saveSettings } = useSettings();
  const { t } = useI18n();
  const { palette } = useAppTheme();
  const { appLockEnabled, biometricUnlockEnabled, hideFinancialValues } = useAppState();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const safeSave = async (input: Parameters<typeof saveSettings>[0]) => {
    if (saving) {
      return false;
    }

    setSaving(true);
    setError(undefined);
    try {
      await saveSettings(input);
      return true;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t('onboarding.securitySaveFailed'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('onboarding.securityTitle')} subtitle={t('onboarding.securitySubtitle')} variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="shield-checkmark-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>{t('onboarding.securityHeroTitle')}</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('onboarding.securityHeroBody')}</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label={t('onboarding.step3')} />
        </View>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('securityFlow.pinTitle')}</AppCard.Title>
        <StatusBadge tone={appLockEnabled ? 'success' : 'info'} label={appLockEnabled ? t('securityFlow.enabled') : t('onboarding.optional')} />
        <AppButton label={appLockEnabled ? t('settings.managePin') : t('settings.enablePin')} variant={appLockEnabled ? 'secondary' : 'primary'} onPress={() => router.push('/security/pin')} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('securityFlow.biometricTitle')}</AppCard.Title>
        <StatusBadge tone={biometricUnlockEnabled ? 'success' : 'info'} label={biometricUnlockEnabled ? t('securityFlow.biometricEnabled') : t('onboarding.optional')} />
        <AppButton label={biometricUnlockEnabled ? t('settings.manageBiometric') : t('settings.enableBiometric')} variant={biometricUnlockEnabled ? 'secondary' : 'primary'} onPress={() => router.push('/security/biometric')} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('onboarding.financialValues')}</AppCard.Title>
        <StatusBadge tone={hideFinancialValues ? 'warning' : 'info'} label={hideFinancialValues ? t('onboarding.hidden') : t('onboarding.visible')} />
        <AppButton label={hideFinancialValues ? t('settings.showValues') : t('settings.hideValues')} disabled={saving} variant={hideFinancialValues ? 'secondary' : 'primary'} onPress={() => void safeSave({ hideFinancialValues: !hideFinancialValues })} />
      </AppCard>

      {error ? <EmptyState title={t('settings.security')} description={translateAppError(error, t)} /> : null}

      <AppButton
        label={t('onboarding.finish')}
        loading={saving}
        onPress={async () => {
          const saved = await safeSave({ hideFinancialValues, onboardingCompleted: true });
          if (saved) {
            router.replace('/onboarding/done');
          }
        }}
      />
      <AppButton label={t('common.back')} variant="ghost" onPress={() => router.back()} />
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
});
