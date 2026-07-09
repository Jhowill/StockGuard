import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/hooks/useI18n';

export default function PremiumScreen() {
  const { t } = useI18n();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('premium.title')} subtitle={t('premium.subtitle')} />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('premium.removeAds')}</AppCard.Title>
        <AppCard.Text>{t('premium.removeAdsBody')}</AppCard.Text>
        <AppButton label={t('premium.watchAd')} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('premium.unlockFeature')}</AppCard.Title>
        <AppCard.Text>{t('premium.unlockFeatureBody')}</AppCard.Text>
        <AppButton label={t('premium.seeOptions')} variant="secondary" />
      </AppCard>
    </ScreenContainer>
  );
}
