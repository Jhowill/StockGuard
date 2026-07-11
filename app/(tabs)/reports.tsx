import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppSelect } from '@/components/ui/AppSelect';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { MetricCard } from '@/components/ui/MetricCard';
import { PremiumLock } from '@/components/ui/PremiumLock';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdPolicyNotice } from '@/components/ads/AdPolicyNotice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReports } from '@/hooks/useReports';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { useI18n } from '@/hooks/useI18n';
import { translateAppError } from '@/i18n/errorMessages';
import { useAppState } from '@/state/app-state';
import { exportReportCsv, exportReportPdf } from '@/services/exportService';
import { showRewardedInterstitial } from '@/services/adsService';
import { consumeFeatureUse, grantFeatureUnlock } from '@/services/rewardedAccessService';
import { formatMoney } from '@/utils/format';
import type { ReportPeriod } from '@/services/reportService';
import type { PremiumFeature } from '@/types/ads';

const periodKeys: Record<ReportPeriod, string> = {
  today: 'reports.today',
  week: 'reports.week',
  month: 'reports.month',
  custom: 'reports.custom',
};

const periods: Array<{ value: ReportPeriod; labelKey: string }> = [
  { value: 'today', labelKey: 'reports.today' },
  { value: 'week', labelKey: 'reports.week' },
  { value: 'month', labelKey: 'reports.month' },
];

export default function ReportsScreen() {
  const { t, language } = useI18n();
  const { currency } = useAppState();
  const { palette } = useAppTheme();
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | undefined>();
  const [lockedFeature, setLockedFeature] = useState<PremiumFeature | undefined>();
  const { summary, loading, error, refresh } = useReports(period);
  const { canUseFeature } = useFeatureGate('csv_export');
  const currentPeriodLabel = t(periodKeys[period]);
  const exportCopy = {
    brand: t('reports.exportBrand'),
    title: t('reports.exportTitle'),
    generatedAtLabel: t('reports.exportGeneratedAt'),
    periodHeading: t('reports.exportPeriod'),
    periodValue: currentPeriodLabel,
    currencyLabel: t('reports.exportCurrency'),
    entriesLabel: t('reports.exportEntries'),
    exitsLabel: t('reports.exportExits'),
    profitLabel: t('reports.exportProfit'),
    productsMovedLabel: t('reports.exportProductsMoved'),
    topProductsTitle: t('reports.exportTopProducts'),
    tableProductLabel: t('reports.exportTableProduct'),
    tableQuantityLabel: t('reports.exportTableQuantity'),
    emptyPeriodLabel: t('reports.exportEmpty'),
    footer: t('reports.exportFooter'),
  };

  const unlockFeature = async (featureKey: PremiumFeature) => {
    setExporting(true);
    setExportError(undefined);
    try {
      const result = await showRewardedInterstitial(featureKey);
      if (result.status !== 'success') {
        throw new Error(result.status === 'cancelled' ? t('ads.cancelled') : result.reason);
      }
      await grantFeatureUnlock(featureKey);
      setLockedFeature(undefined);
    } catch (nextError) {
      setExportError(nextError instanceof Error ? nextError.message : t('premium.featureFailed'));
    } finally {
      setExporting(false);
    }
  };

  const exportReport = async (format: 'csv' | 'pdf') => {
    if (!summary || exporting) {
      return;
    }

    const featureKey: PremiumFeature = format === 'csv' ? 'csv_export' : 'advanced_pdf_reports';
    setExporting(true);
    setExportError(undefined);
    try {
      const allowed = await canUseFeature(featureKey);
      if (!allowed) {
        setLockedFeature(featureKey);
        return;
      }

      if (format === 'csv') {
        await exportReportCsv(summary, exportCopy, language);
      } else {
        await exportReportPdf(summary, exportCopy, language);
      }

      await consumeFeatureUse(featureKey);
    } catch (nextError) {
      setExportError(nextError instanceof Error ? nextError.message : t('reports.exportError'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="bar-chart-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>{t('reports.heroTitle')}</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('reports.heroBody')}</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label={currentPeriodLabel} />
          <StatusBadge tone="success" label={summary ? t('products.items', { count: summary.movedProductsCount }) : '...'} />
        </View>
      </AppCard>

      <AdPolicyNotice
        title={t('ads.rewardTitle')}
        body={t('ads.rewardBody')}
        icon="sparkles-outline"
        tone="reward"
      />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('reports.period')}</AppCard.Title>
        <AppCard.Text>{t('reports.periodBody')}</AppCard.Text>
        <AppSelect
          label={t('reports.interval')}
          value={period}
          options={periods.map((item) => ({ value: item.value, label: t(item.labelKey) }))}
          disabled={exporting}
          onChange={setPeriod}
        />
      </AppCard>

      {loading ? (
        <EmptyState title={t('reports.title')} description={t('common.loading')} icon="bar-chart-outline" />
      ) : error ? (
        <EmptyState title={t('reports.title')} description={translateAppError(error, t)} icon="bar-chart-outline" actionLabel={t('common.retry')} onActionPress={() => void refresh()} />
      ) : summary ? (
        <>
          <View style={styles.metricRows}>
            <View style={styles.metricRow}>
              <MetricCard compact label={t('reports.entries')} value={formatMoney(summary.entriesValueCents, currency, language)} />
              <MetricCard compact label={t('reports.exits')} value={formatMoney(summary.exitsValueCents, currency, language)} />
            </View>
            <View style={styles.metricRow}>
              <MetricCard compact label={t('reports.profit')} value={formatMoney(summary.estimatedProfitCents ?? 0, currency, language)} />
              <MetricCard compact label={t('reports.products')} value={String(summary.movedProductsCount)} />
            </View>
          </View>

          <AppCard style={{ gap: 12 }}>
            <AppCard.Title>{t('reports.topProducts')}</AppCard.Title>
            {summary.topProductsByQuantity.length > 0 ? (
              summary.topProductsByQuantity.map((product) => (
                <AppCard.Row
                  key={product.productId}
                  icon="bar-chart-outline"
                  title={product.productName}
                  subtitle={t('reports.movementsCount', { count: product.quantity })}
                  trailing={<StatusBadge tone="info" label={String(product.quantity)} />}
                />
              ))
            ) : (
              <EmptyState title={t('reports.topProducts')} description={t('reports.topProductsEmpty')} icon="bar-chart-outline" />
            )}
          </AppCard>

          <AppCard style={{ gap: 12 }}>
            <AppCard.Title>{t('reports.overview')}</AppCard.Title>
            <AppCard.Text>{t('reports.overviewBody')}</AppCard.Text>
            <AppButton label={exporting ? '...' : t('reports.exportCsv')} variant="secondary" disabled={exporting} onPress={() => void exportReport('csv')} />
            <AppButton label={exporting ? '...' : t('reports.generatePdf')} disabled={exporting} onPress={() => void exportReport('pdf')} />
          </AppCard>

          {lockedFeature ? (
            <PremiumLock
              title={lockedFeature === 'csv_export' ? t('reports.csvLocked') : t('reports.pdfLocked')}
              description={lockedFeature === 'csv_export' ? t('ads.rewardBody') : t('ads.reportBody')}
              busy={exporting}
              onUnlock={() => void unlockFeature(lockedFeature)}
            />
          ) : null}

          {exportError ? <ErrorState title={t('common.export')} description={translateAppError(exportError, t)} /> : null}
        </>
      ) : null}
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
  metricRows: {
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
