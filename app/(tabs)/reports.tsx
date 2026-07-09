import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/hooks/useI18n';
import { useAppState } from '@/state/app-state';
import { formatMoney } from '@/utils/format';

export default function ReportsScreen() {
  const { t } = useI18n();
  const { currency } = useAppState();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />

      <AppCard style={{ flexDirection: 'row', gap: 12 }}>
        <MetricCard compact label={t('reports.in')} value={formatMoney(325000, currency)} />
        <MetricCard compact label={t('reports.out')} value={formatMoney(198000, currency)} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('reports.overview')}</AppCard.Title>
        <AppCard.Text>{t('reports.overviewBody')}</AppCard.Text>
        <AppButton label={t('reports.exportCsv')} variant="secondary" />
        <AppButton label={t('reports.generatePdf')} />
      </AppCard>
    </ScreenContainer>
  );
}
