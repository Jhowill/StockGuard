import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';

export default function OnboardingScreen() {
  const { t } = useI18n();
  const { palette } = useAppTheme();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('onboarding.title')} subtitle={t('onboarding.subtitle')} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="shield-checkmark-outline" size={30} color={palette.primary} />
        </View>
        <Text style={[styles.heroTitle, { color: palette.text }]}>
          Controle de estoque offline, pronto para uso no celular.
        </Text>
        <Text style={[styles.heroBody, { color: palette.textMuted }]}>
          Cadastre produtos, acompanhe movimentações, veja alertas e mantenha seus dados locais.
        </Text>
      </AppCard>

      <AppCard style={styles.featureGrid}>
        <AppCard.Row icon="cloud-offline-outline" title={t('onboarding.offline')} />
        <AppCard.Row icon="shield-checkmark-outline" title={t('onboarding.secure')} />
        <AppCard.Row icon="layers-outline" title={t('onboarding.complete')} />
      </AppCard>

      <AppButton label={t('onboarding.start')} onPress={() => router.push('/onboarding/usage-type')} />
      <AppButton label={t('onboarding.skip')} variant="ghost" onPress={() => router.push('/onboarding/done')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    gap: 14,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
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
  featureGrid: {
    gap: 12,
  },
});
