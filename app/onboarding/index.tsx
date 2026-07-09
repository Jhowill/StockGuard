import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/hooks/useI18n';
import { useAppState } from '@/state/app-state';

export default function OnboardingScreen() {
  const { t } = useI18n();
  const { completeOnboarding } = useAppState();
  const [submitting, setSubmitting] = useState(false);

  const handleStart = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await completeOnboarding();
      router.replace('/(tabs)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title={t('onboarding.title')}
        subtitle={t('onboarding.subtitle')}
      />

      <AppCard variant="hero" style={{ alignItems: 'center', gap: 16 }}>
        <Ionicons name="cube-outline" size={72} color="#B7F34D" />
        <AppCard.Title>{t('onboarding.featureOne')}</AppCard.Title>
        <AppCard.Text>{t('onboarding.featureBody')}</AppCard.Text>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Row icon="cloud-offline-outline" title={t('onboarding.offline')} />
        <AppCard.Row icon="shield-checkmark-outline" title={t('onboarding.secure')} />
        <AppCard.Row icon="layers-outline" title={t('onboarding.complete')} />
      </AppCard>

      <AppButton label={t('onboarding.start')} onPress={handleStart} />
      <AppButton
        label={t('onboarding.skip')}
        variant="ghost"
        onPress={handleStart}
      />
    </ScreenContainer>
  );
}
