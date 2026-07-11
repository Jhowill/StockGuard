import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { useSettings } from '@/hooks/useSettings';

export default function OnboardingDoneScreen() {
  const { t } = useI18n();
  const { palette } = useAppTheme();
  const { saveSettings } = useSettings();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('onboarding.doneTitle')} subtitle={t('onboarding.doneSubtitle')} variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="checkmark-circle-outline" size={34} color={palette.success} />
        </View>
        <Text style={[styles.heroTitle, { color: palette.text }]}>{t('onboarding.doneHeroTitle')}</Text>
        <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('onboarding.doneHeroBody')}</Text>
        <StatusBadge tone="success" label={t('onboarding.step4')} />
      </AppCard>

      <AppButton
        label={t('onboarding.enterApp')}
        loading={busy}
        onPress={async () => {
          if (busy) {
            return;
          }

          setBusy(true);
          setError(undefined);
          try {
            await saveSettings({ onboardingCompleted: true });
            router.replace('/(tabs)');
          } catch {
            setError(t('onboarding.doneFailed'));
          } finally {
            setBusy(false);
          }
        }}
      />
      {error ? <Text style={[styles.heroBody, { color: palette.danger }]}>{error}</Text> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    gap: 14,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
