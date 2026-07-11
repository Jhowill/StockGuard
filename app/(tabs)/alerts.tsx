import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAlerts } from '@/hooks/useAlerts';
import { useI18n } from '@/hooks/useI18n';
import { translateAppError } from '@/i18n/errorMessages';

function getAlertLabel(kind: string, t: (key: string) => string) {
  switch (kind) {
    case 'zero':
      return t('alerts.zero');
    case 'low':
      return t('alerts.low');
    case 'expiring':
      return t('alerts.expiring');
    default:
      return kind;
  }
}

export default function AlertsScreen() {
  const { t } = useI18n();
  const { alerts, loading, error, refresh } = useAlerts();
  const { palette } = useAppTheme();
  const totalAlerts = alerts.reduce((sum, alert) => sum + alert.count, 0);

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('alerts.title')} subtitle={t('alerts.subtitle')} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="warning-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>{t('alerts.heroTitle')}</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('alerts.heroBody')}</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="warning" label={t('alerts.pending', { count: totalAlerts })} />
          <StatusBadge tone="info" label={t('alerts.groups', { count: alerts.length })} />
        </View>
      </AppCard>

      {loading ? (
        <LoadingState title={t('alerts.title')} description={t('common.loading')} />
      ) : error ? (
        <EmptyState title={t('alerts.title')} description={translateAppError(error, t)} />
      ) : alerts.length === 0 ? (
        <EmptyState title={t('alerts.emptyTitle')} description={t('alerts.emptyBody')} />
      ) : (
        alerts.map((alert) => (
          <AppCard key={alert.id} onPress={() => router.push({ pathname: '/(tabs)/products', params: { filter: alert.kind } })}>
            <AppCard.Row
              icon={alert.kind === 'zero' ? 'alert-circle-outline' : alert.kind === 'low' ? 'warning-outline' : 'calendar-outline'}
              title={getAlertLabel(alert.kind, t)}
              subtitle={t('alerts.products', { count: alert.count })}
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
