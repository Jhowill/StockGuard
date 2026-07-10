import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { MetricCard } from '@/components/ui/MetricCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDashboard } from '@/hooks/useDashboard';
import { useAppState } from '@/state/app-state';
import { formatMoney } from '@/utils/format';
import { formatShortDateTime } from '@/utils/date-format';

function getMovementLabel(type: string) {
  switch (type) {
    case 'in':
      return 'Entrada';
    case 'out':
      return 'Saida';
    case 'loss':
      return 'Perda';
    case 'return':
      return 'Devolucao';
    case 'adjustment_positive':
    case 'adjustment_negative':
      return 'Ajuste';
    case 'initial_balance':
      return 'Ajuste inicial';
    default:
      return 'Ajuste';
  }
}

function getMovementTone(type: string) {
  switch (type) {
    case 'in':
    case 'return':
      return 'success' as const;
    case 'out':
    case 'adjustment_negative':
      return 'warning' as const;
    case 'loss':
      return 'danger' as const;
    default:
      return 'info' as const;
  }
}

export default function HomeScreen() {
  const { currency } = useAppState();
  const { palette } = useAppTheme();
  const { summary, loading, error, refresh } = useDashboard();

  const lastActivity = summary.lastMovements[0]?.createdAt;
  const heroHint = loading
    ? 'Atualizado hoje'
    : lastActivity
      ? `Ultima atualizacao | ${formatShortDateTime(lastActivity)}`
      : 'Nenhuma movimentacao recente';

  return (
    <ScreenContainer scroll padded>
      <View style={[styles.glow, styles.glowTop, { backgroundColor: palette.primary }]} />
      <View style={[styles.glow, styles.glowBottom, { backgroundColor: palette.premium }]} />

      <AppHeader
        title="Olá, João! 👋"
        subtitle="Aqui está o resumo do seu estoque"
        rightAction={
          <View style={styles.headerAction}>
            <Ionicons name="notifications-outline" size={22} color={palette.text} />
            <View style={[styles.notificationDot, { backgroundColor: palette.danger }]} />
          </View>
        }
      />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroLabel, { color: palette.textMuted }]}>Valor total em estoque</Text>
            <Text style={[styles.heroValue, { color: palette.text }]}>
              {loading ? '...' : formatMoney(summary.totalStockValueCents, currency)}
            </Text>
            <Text style={[styles.heroHint, { color: palette.textMuted }]}>{heroHint}</Text>
          </View>

          <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={palette.primary} />
          </View>
        </View>

        <View style={styles.heroBadges}>
          <StatusBadge tone="success" label={`${loading ? '—' : summary.activeProductsCount} Produtos`} />
          <StatusBadge tone="warning" label={`${loading ? '—' : summary.lowStockCount} Baixo estoque`} />
        </View>
      </AppCard>

      <View style={styles.metricRow}>
        <MetricCard compact label="Produtos" value={loading ? '—' : String(summary.activeProductsCount)} hint="Atualizado hoje" />
        <MetricCard compact label="Itens baixos" value={loading ? '—' : String(summary.lowStockCount)} hint="Itens criticos" />
      </View>

      <AppCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Ultimas movimentacoes</Text>
            <Text style={[styles.sectionBody, { color: palette.textMuted }]}>Veja as ultimas entradas e saidas registradas localmente.</Text>
          </View>
          <Ionicons name="time-outline" size={20} color={palette.primary} />
        </View>

        {error ? (
          <EmptyState title="Nenhuma movimentacao recente" description={error} actionLabel="Tentar novamente" onActionPress={() => void refresh()} />
        ) : summary.lastMovements.length > 0 ? (
          <View style={styles.listGap}>
            {summary.lastMovements.map((movement) => (
              <AppCard.Row
                key={movement.id}
                icon={movement.type === 'in' ? 'arrow-up-outline' : movement.type === 'out' ? 'arrow-down-outline' : movement.type === 'loss' ? 'warning-outline' : 'swap-horizontal-outline'}
                title={movement.productName}
                subtitle={`${getMovementLabel(movement.type)} • ${formatShortDateTime(movement.createdAt)}`}
                trailing={<StatusBadge tone={getMovementTone(movement.type)} label={`x${movement.quantity}`} />}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="Nenhuma movimentacao recente" description="Quando voce salvar entradas ou saidas, tudo aparece aqui." />
        )}
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Alertas</Text>
            <Text style={[styles.sectionBody, { color: palette.textMuted }]}>Reponha, revise ou ajuste os itens criticos.</Text>
          </View>
          <Ionicons name="alert-circle-outline" size={20} color={palette.warning} />
        </View>

        {summary.zeroStockCount > 0 || summary.lowStockCount > 0 || summary.expiringSoonCount > 0 ? (
          <View style={styles.listGap}>
            {summary.zeroStockCount > 0 ? (
              <AppCard.Row icon="alert-circle-outline" title="Zerados" subtitle={`${summary.zeroStockCount} itens sem saldo`} trailing={<StatusBadge tone="danger" label="0" />} />
            ) : null}
            {summary.lowStockCount > 0 ? (
              <AppCard.Row icon="warning-outline" title="Baixo estoque" subtitle={`${summary.lowStockCount} itens no limite`} trailing={<StatusBadge tone="warning" label={String(summary.lowStockCount)} />} />
            ) : null}
            {summary.expiringSoonCount > 0 ? (
              <AppCard.Row icon="calendar-outline" title="Vencendo" subtitle={`${summary.expiringSoonCount} itens proximos da validade`} trailing={<StatusBadge tone="info" label={String(summary.expiringSoonCount)} />} />
            ) : null}
          </View>
        ) : (
          <EmptyState title="Sem alertas agora" description="Quando algo sair do esperado, ele aparece aqui." />
        )}
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 18,
  },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  heroHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionCard: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionCopy: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  listGap: {
    gap: 10,
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
  },
  glowTop: {
    width: 240,
    height: 240,
    top: -100,
    right: -120,
  },
  glowBottom: {
    width: 320,
    height: 320,
    bottom: -140,
    left: -140,
  },
});
