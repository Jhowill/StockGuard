import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/hooks/useI18n';

export default function TermsScreen() {
  const { t } = useI18n();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('terms.title')} subtitle={t('terms.subtitle')} variant="page" onBackPress={() => router.back()} />

      <AppCard style={styles.card}>
        <AppCard.Title>{t('terms.useTitle')}</AppCard.Title>
        <AppCard.Text>{t('terms.useBody')}</AppCard.Text>
      </AppCard>

      <AppCard style={styles.card}>
        <AppCard.Title>{t('terms.dataTitle')}</AppCard.Title>
        <AppCard.Text>{t('terms.dataBody')}</AppCard.Text>
      </AppCard>

      <AppCard style={styles.card}>
        <AppCard.Title>{t('terms.adsTitle')}</AppCard.Title>
        <AppCard.Text>{t('terms.adsBody')}</AppCard.Text>
      </AppCard>

      <AppCard style={styles.card}>
        <AppCard.Title>{t('terms.contactTitle')}</AppCard.Title>
        <AppCard.Text>{t('terms.contactBody')}</AppCard.Text>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
});
