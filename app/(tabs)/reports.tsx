import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { MetricCard } from '@/components/ui/MetricCard';
import { PremiumLock } from '@/components/ui/PremiumLock';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useReports } from '@/hooks/useReports';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { useAppState } from '@/state/app-state';
import { exportReportCsv, exportReportPdf } from '@/services/exportService';
import { showRewardedInterstitial } from '@/services/adsService';
import { grantFeatureUnlock } from '@/services/rewardedAccessService';
import { formatMoney } from '@/utils/format';
import type { ReportPeriod } from '@/services/reportService';
import type { PremiumFeature } from '@/types/ads';

const periods: Array<{ value: ReportPeriod; label: string }> = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: '7 dias' },
  { value: 'month', label: '30 dias' },
];

export default function ReportsScreen() {
  const { currency } = useAppState();
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | undefined>();
  const [lockedFeature, setLockedFeature] = useState<PremiumFeature | undefined>();
  const { summary, loading, error, refresh } = useReports(period);
  const { canUseFeature } = useFeatureGate('csv_export');

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
    } catch (nextError) {
      setExportError(nextError instanceof Error ? nextError.message : 'Nao foi possivel exportar o relatorio.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Relatorios" subtitle="Resumo de entradas, saidas e lucro." />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Periodo</AppCard.Title>
        <AppCard.Text>{period}</AppCard.Text>
        {periods.map((item) => (
          <AppButton key={item.value} label={item.label} variant={period === item.value ? 'primary' : 'ghost'} onPress={() => setPeriod(item.value)} />
        ))}
      </AppCard>

      {loading ? (
        <EmptyState title="Relatorios" description="Carregando..." />
      ) : error ? (
        <EmptyState title="Relatorios" description={error} actionLabel="Tentar novamente" onActionPress={() => void refresh()} />
      ) : summary ? (
        <>
          <AppCard style={{ flexDirection: 'row', gap: 12 }}>
            <MetricCard compact label="Entradas" value={formatMoney(summary.entriesValueCents, currency)} />
            <MetricCard compact label="Saidas" value={formatMoney(summary.exitsValueCents, currency)} />
          </AppCard>

          <AppCard style={{ flexDirection: 'row', gap: 12 }}>
            <MetricCard compact label="Lucro estimado" value={formatMoney(summary.estimatedProfitCents ?? 0, currency)} />
            <MetricCard compact label="Produtos" value={String(summary.movedProductsCount)} />
          </AppCard>

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
              <EmptyState title="Principais produtos" description="Sem dados para este periodo." />
            )}
          </AppCard>

          <AppCard style={{ gap: 12 }}>
            <AppCard.Title>Visao geral</AppCard.Title>
            <AppCard.Text>Relatorio local do estoque com dados reais do banco.</AppCard.Text>
            <AppButton label={exporting ? '...' : 'Exportar CSV'} variant="secondary" disabled={exporting} onPress={() => void exportReport('csv')} />
            <AppButton label={exporting ? '...' : 'Gerar PDF'} disabled={exporting} onPress={() => void exportReport('pdf')} />
          </AppCard>

          {lockedFeature ? (
            <PremiumLock
              title={lockedFeature === 'csv_export' ? 'CSV avancado bloqueado' : 'PDF avancado bloqueado'}
              description="Assista a um anuncio para liberar este recurso temporariamente sem bloquear seus dados."
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
