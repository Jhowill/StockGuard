import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/hooks/useI18n';

export default function MovementScreen() {
  const { t } = useI18n();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('movement.title')} subtitle={t('movement.subtitle')} />

      <AppCard style={{ gap: 12 }}>
        <AppInput label={t('movement.product')} placeholder={t('movement.selectProduct')} />
        <AppInput label={t('movement.quantity')} placeholder="0" keyboardType="numeric" />
        <AppInput label={t('movement.reason')} placeholder={t('movement.reasonPlaceholder')} />
        <AppInput label={t('movement.notes')} placeholder={t('movement.notesPlaceholder')} multiline />
      </AppCard>

      <AppButton label={t('movement.save')} onPress={() => router.back()} />
    </ScreenContainer>
  );
}
