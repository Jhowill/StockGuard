import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { demoAlerts } from '@/data/demo';
import { useI18n } from '@/hooks/useI18n';

export default function AlertsScreen() {
  const { t } = useI18n();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('alerts.title')} subtitle={t('alerts.subtitle')} />

      {demoAlerts.length === 0 ? (
        <EmptyState title={t('alerts.emptyTitle')} description={t('alerts.emptyBody')} />
      ) : (
        demoAlerts.map((alert) => (
          <AppCard key={alert.id}>
            <AppCard.Row
              icon="alert-circle-outline"
              title={alert.title}
              subtitle={alert.subtitle}
              trailing={<StatusBadge tone={alert.tone} label={alert.count} />}
            />
          </AppCard>
        ))
      )}
    </ScreenContainer>
  );
}
