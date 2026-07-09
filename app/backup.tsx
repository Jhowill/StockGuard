import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/hooks/useI18n';

export default function BackupScreen() {
  const { t } = useI18n();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('backup.title')} subtitle={t('backup.subtitle')} />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('backup.create')}</AppCard.Title>
        <AppCard.Text>{t('backup.createBody')}</AppCard.Text>
        <AppButton label={t('backup.createAction')} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('backup.restore')}</AppCard.Title>
        <AppCard.Text>{t('backup.restoreBody')}</AppCard.Text>
        <AppButton label={t('backup.restoreAction')} variant="secondary" />
      </AppCard>
    </ScreenContainer>
  );
}
