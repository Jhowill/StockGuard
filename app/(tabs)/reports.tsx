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
import { useAppState } from '@/state/app-state';
import { exportReportCsv, exportReportPdf } from '@/services/exportService';
import { showRewardedInterstitial } from '@/services/adsService';
import { consumeFeatureUse, grantFeatureUnlock } from '@/services/rewardedAccessService';
import { formatMoney } from '@/utils/format';
import type { ReportPeriod } from '@/services/reportService';
import type { PremiumFeature } from '@/types/ads';

const periods: Array<{ value: ReportPeriod; label: string }> = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: '7 dias' },
  { value: 'month', label: '30 dias' },
];

export default function ReportsScreen() {
  const { t } = useI18n();
  const { currency } = useAppState();
  const { palette } = useAppTheme();
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | undefined>();
  const [lockedFeature, setLockedFeature] = useState<PremiumFeature | undefined>();
  const { summary, loading, error, refresh } = useReports(period);
  const { canUseFeature } = useFeatureGate('csv_export');
  const currentPeriodLabel = periods.find((item) => item.value === period)?.label ?? period;

  const unlockFeature = async (featureKey: PremiumFeature) => {
    setExporting(true);
    setExportError(undefined);
    try {
      const result = await showRewardedInterstitial(featureKey);
      if (result.status !== 'success') {
        throw new Error(result.status === 'cancelled' ? 'Anuncio cancelado.' : result.reason);
      }
      await grantFeatureUnlock(featureKey);
      setLockedFeature(undefined);
    } catch (nextError) {
      setExportError(nextError instanceof Error ? nextError.message : 'Nao foi possivel liberar o recurso.');
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
        await exportReportCsv(summary);
      } else {
        await exportReportPdf(summary);
      }

      await consumeFeatureUse(featureKey);
    } catch (nextError) {
      setExportError(nextError instanceof Error ? nextError.message : 'Nao foi possivel exportar o relatorio.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('reports.title')} subtitle={t('reports.subtitle')} rightAction={<Ionicons name="bar-chart-outline" size={22} color={palette?.primary ?? undefined} />} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="bar-chart-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Resumo rapido do periodo</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>Visualize entradas, saidas, lucro estimado e movimentos sem sair do app.</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label={currentPeriodLabel} />
          <StatusBadge tone="success" label={summary ? `${summary.movedProductsCount} itens` : '...'} />
        </View>
      </AppCard>

      <AdPolicyNotice
        title={t('ads.rewardTitle')}
        body={t('ads.rewardBody')}
        icon="sparkles-outline"
        tone="reward"
      />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Periodo</AppCard.Title>
        <AppCard.Text>Escolha o intervalo para resumir vendas, entradas e saidas.</AppCard.Text>
        <AppSelect
          label="Intervalo"
          value={period}
          options={periods}
          disabled={exporting}
          onChange={setPeriod}
        />
      </AppCard>

      {loading ? (
        <EmptyState title="Relatorios" description="Carregando..." icon="bar-chart-outline" />
      ) : error ? (
        <EmptyState title="Relatorios" description={error} icon="bar-chart-outline" actionLabel="Tentar novamente" onActionPress={() => void refresh()} />
      ) : summary ? (
        <>
          <View style={styles.metricRows}>
            <View style={styles.metricRow}>
              <MetricCard compact label="Entradas" value={formatMoney(summary.entriesValueCents, currency)} />
              <MetricCard compact label="Saidas" value={formatMoney(summary.exitsValueCents, currency)} />
            </View>
            <View style={styles.metricRow}>
              <MetricCard compact label="Lucro estimado" value={formatMoney(summary.estimatedProfitCents ?? 0, currency)} />
              <MetricCard compact label="Produtos" value={String(summary.movedProductsCount)} />
            </View>
          </View>

          <AppCard style={{ gap: 12 }}>
            <AppCard.Title>Principais produtos</AppCard.Title>
            {summary.topProductsByQuantity.length > 0 ? (
              summary.topProductsByQuantity.map((product) => (
                <AppCard.Row
                  key={product.productId}
                  icon="bar-chart-outline"
                  title={product.productName}
                  subtitle={`${product.quantity} movimentacoes`}
                  trailing={<StatusBadge tone="info" label={String(product.quantity)} />}
                />
              ))
            ) : (
              <EmptyState title="Principais produtos" description="Sem dados para este periodo." icon="bar-chart-outline" />
            )}
          </AppCard>

          <AppCard style={{ gap: 12 }}>
            <AppCard.Title>{t('reports.overview')}</AppCard.Title>
            <AppCard.Text>{t('reports.overviewBody')}</AppCard.Text>
            <AppButton label={exporting ? '...' : 'Exportar CSV'} variant="secondary" disabled={exporting} onPress={() => void exportReport('csv')} />
            <AppButton label={exporting ? '...' : 'Gerar PDF'} disabled={exporting} onPress={() => void exportReport('pdf')} />
          </AppCard>

          {lockedFeature ? (
            <PremiumLock
              title={lockedFeature === 'csv_export' ? 'CSV avancado bloqueado' : 'PDF avancado bloqueado'}
              description={lockedFeature === 'csv_export' ? t('ads.rewardBody') : t('ads.reportBody')}
              busy={exporting}
              onUnlock={() => void unlockFeature(lockedFeature)}
            />
          ) : null}

          {exportError ? <ErrorState title="Exportacao" description={exportError} /> : null}
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
