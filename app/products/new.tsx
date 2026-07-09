import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/hooks/useI18n';

export default function NewProductScreen() {
  const { t } = useI18n();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('productNew.title')} subtitle={t('productNew.subtitle')} />

      <AppCard style={{ gap: 12 }}>
        <AppInput label={t('productNew.name')} placeholder={t('productNew.namePlaceholder')} />
        <AppInput label={t('productNew.category')} placeholder={t('productNew.categoryPlaceholder')} />
        <AppInput label={t('productNew.quantity')} placeholder="0" keyboardType="numeric" />
        <AppInput label={t('productNew.minQuantity')} placeholder="0" keyboardType="numeric" />
        <AppInput label={t('productNew.notes')} placeholder={t('productNew.notesPlaceholder')} multiline />
      </AppCard>

      <AppButton label={t('common.save')} onPress={() => router.back()} />
    </ScreenContainer>
  );
}
