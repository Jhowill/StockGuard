import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { MetricCard } from '@/components/ui/MetricCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDashboard } from '@/hooks/useDashboard';
import { useI18n } from '@/hooks/useI18n';
import { useAppState } from '@/state/app-state';
import { formatMoney } from '@/utils/format';
import { formatShortDateTime } from '@/utils/date-format';

export default function HomeScreen() {
  const { t } = useI18n();
  const { currency } = useAppState();
  const { palette } = useAppTheme();
  const { summary, loading, error, refresh } = useDashboard();

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        rightAction={
          <Ionicons
            name="notifications-outline"
            size={22}
            color={palette.primary}
          />
        }
      />

      <MetricCard
        label={t('home.stockValue')}
        value={loading ? '...' : formatMoney(summary.totalStockValueCents, currency)}
        hint={t('home.updatedToday')}
      />

      <AppCard style={{ flexDirection: 'row', gap: 12 }}>
        <MetricCard compact label={t('home.products')} value={String(summary.activeProductsCount)} />
        <MetricCard compact label={t('home.lowStock')} value={String(summary.lowStockCount)} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('home.quickActions')}</AppCard.Title>
        <AppButton label={t('home.addProduct')} onPress={() => router.push('/products/new')} />
        <AppButton label={t('home.makeMovement')} variant="secondary" onPress={() => router.push('/products/movement')} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('home.recentMovements')}</AppCard.Title>
        {error ? (
          <EmptyState title={t('home.noAlerts')} description={error} actionLabel={t('common.retry')} onActionPress={() => void refresh()} />
        ) : summary.lastMovements.length > 0 ? (
          summary.lastMovements.map((movement) => (
            <AppCard.Row
              key={movement.id}
              icon={movement.type === 'in' ? 'arrow-up-outline' : movement.type === 'out' ? 'arrow-down-outline' : 'sync-outline'}
              title={movement.reason}
              subtitle={formatShortDateTime(movement.createdAt)}
              trailing={<StatusBadge tone={movement.type === 'in' ? 'success' : movement.type === 'out' ? 'warning' : 'info'} label={String(movement.quantity)} />}
            />
          ))
        ) : (
          <EmptyState title={t('home.noAlerts')} description={t('home.noAlertsBody')} />
        )}
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('home.alerts')}</AppCard.Title>
        {summary.zeroStockCount > 0 || summary.lowStockCount > 0 ? (
          <>
            {summary.zeroStockCount > 0 ? (
              <AppCard.Row
                icon="alert-circle-outline"
                title={t('home.noAlerts')}
                subtitle={String(summary.zeroStockCount)}
                trailing={<StatusBadge tone="danger" label="0" />}
              />
            ) : null}
            {summary.lowStockCount > 0 ? (
              <AppCard.Row
                icon="warning-outline"
                title={t('home.lowStock')}
                subtitle={String(summary.lowStockCount)}
                trailing={<StatusBadge tone="warning" label={String(summary.lowStockCount)} />}
              />
            ) : null}
          </>
        ) : (
          <EmptyState title={t('home.noAlerts')} description={t('home.noAlertsBody')} />
        )}
      </AppCard>
    </ScreenContainer>
  );
}
