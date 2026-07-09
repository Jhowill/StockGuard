import { router } from 'expo-router';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAlerts } from '@/hooks/useAlerts';

export default function AlertsScreen() {
  const { alerts, loading, error } = useAlerts();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Alertas" subtitle="Itens que precisam de atencao." />

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
              title={alert.kind}
              subtitle={`${alert.count} produtos`}
              trailing={<StatusBadge tone={alert.tone} label={String(alert.count)} />}
            />
          </AppCard>
        ))
      )}
    </ScreenContainer>
  );
}
