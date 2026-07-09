import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { MetricCard } from '@/components/ui/MetricCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { demoAlerts, demoMetrics, demoMovements } from '@/data/demo';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { useAppState } from '@/state/app-state';
import { formatMoney } from '@/utils/format';

export default function HomeScreen() {
  const { t } = useI18n();
  const { currency } = useAppState();
  const { palette } = useAppTheme();

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
        value={formatMoney(demoMetrics.stockValueCents, currency)}
        hint={t('home.updatedToday')}
      />

      <AppCard style={{ flexDirection: 'row', gap: 12 }}>
        <MetricCard compact label={t('home.products')} value={String(demoMetrics.products)} />
        <MetricCard compact label={t('home.lowStock')} value={String(demoMetrics.lowStock)} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('home.quickActions')}</AppCard.Title>
        <AppButton label={t('home.addProduct')} onPress={() => router.push('/products/new')} />
        <AppButton label={t('home.makeMovement')} variant="secondary" onPress={() => router.push('/products/movement')} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('home.recentMovements')}</AppCard.Title>
        {demoMovements.map((movement) => (
          <AppCard.Row
            key={movement.id}
            icon={movement.icon}
            title={movement.title}
            subtitle={movement.subtitle}
            trailing={<StatusBadge tone={movement.tone} label={movement.value} />}
          />
        ))}
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('home.alerts')}</AppCard.Title>
        {demoAlerts.length > 0 ? (
          demoAlerts.map((alert) => (
            <AppCard.Row
              key={alert.id}
              icon="warning-outline"
              title={alert.title}
              subtitle={alert.subtitle}
              trailing={<StatusBadge tone={alert.tone} label={alert.count} />}
            />
          ))
        ) : (
          <EmptyState title={t('home.noAlerts')} description={t('home.noAlertsBody')} />
        )}
      </AppCard>
    </ScreenContainer>
  );
}
