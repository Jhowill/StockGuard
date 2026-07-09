import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { MetricCard } from '@/components/ui/MetricCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useReports } from '@/hooks/useReports';
import { useAppState } from '@/state/app-state';
import { formatMoney } from '@/utils/format';
import type { ReportPeriod } from '@/services/reportService';

const periods: Array<{ value: ReportPeriod; label: string }> = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: '7 dias' },
  { value: 'month', label: '30 dias' },
];

export default function ReportsScreen() {
  const { currency } = useAppState();
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const { summary, loading, error, refresh } = useReports(period);

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
            <AppButton label="Exportar CSV" variant="secondary" />
            <AppButton label="Gerar PDF" />
          </AppCard>
        </>
      ) : null}
    </ScreenContainer>
  );
}
