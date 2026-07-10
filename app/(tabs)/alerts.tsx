import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAlerts } from '@/hooks/useAlerts';

function getAlertLabel(kind: string) {
  switch (kind) {
    case 'zero':
      return 'Sem estoque';
    case 'low':
      return 'Baixo estoque';
    case 'expiration':
      return 'Vencimento';
    default:
      return kind;
  }
}

export default function AlertsScreen() {
  const { alerts, loading, error } = useAlerts();
  const { palette } = useAppTheme();
  const totalAlerts = alerts.reduce((sum, alert) => sum + alert.count, 0);

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Alertas" subtitle="Itens que precisam de atencao." rightAction={<Ionicons name="alert-circle-outline" size={22} color={palette.primary} />} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="warning-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Resumo das pendencias</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>Veja rapidamente onde ha risco de ruptura, validade ou baixa reposicao.</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="warning" label={`${totalAlerts} pendencias`} />
          <StatusBadge tone="info" label={`${alerts.length} grupos`} />
        </View>
      </AppCard>

      {loading ? (
        <EmptyState title="Alertas" description="Carregando..." />
      ) : error ? (
        <EmptyState title="Alertas" description={error} />
      ) : alerts.length === 0 ? (
        <EmptyState title="Tudo em ordem" description="Nenhum alerta no momento." />
      ) : (
        alerts.map((alert) => (
          <AppCard key={alert.id} onPress={() => router.push('/(tabs)/products')}>
            <AppCard.Row
              icon={alert.kind === 'zero' ? 'alert-circle-outline' : alert.kind === 'low' ? 'warning-outline' : 'calendar-outline'}
              title={getAlertLabel(alert.kind)}
              subtitle={`${alert.count} produtos`}
              trailing={<StatusBadge tone={alert.tone} label={String(alert.count)} />}
            />
          </AppCard>
        ))
      )}
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
});
