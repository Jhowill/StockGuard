import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
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

function getMovementLabel(type: string, t: (key: string) => string) {
  switch (type) {
    case 'in':
      return t('movement.typeIn');
    case 'out':
      return t('movement.typeOut');
    case 'loss':
      return t('movement.typeLoss');
    case 'return':
      return t('movement.typeReturn');
    case 'adjustment_positive':
    case 'adjustment_negative':
      return t('movement.typeAdjustment');
    case 'initial_balance':
      return t('movement.typeAdjustment');
    default:
      return t('movement.typeAdjustment');
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
  const { t } = useI18n();
  const { currency } = useAppState();
  const { palette } = useAppTheme();
  const { summary, loading, error, refresh } = useDashboard();

  const lastActivity = summary.lastMovements[0]?.createdAt;
  const heroHint = loading
    ? t('home.updatedToday')
    : lastActivity
      ? `${t('home.lastUpdated')} · ${formatShortDateTime(lastActivity)}`
      : t('home.noRecentMovements');

  return (
    <ScreenContainer scroll padded>
      <View style={[styles.glow, styles.glowTop, { backgroundColor: palette.primary }]} />
      <View style={[styles.glow, styles.glowBottom, { backgroundColor: palette.premium }]} />

      <AppHeader
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        rightAction={<StatusBadge tone="info" label={t('home.offlineBadge')} />}
      />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroLabel, { color: palette.textMuted }]}>
              {t('home.stockValue')}
            </Text>
            <Text style={[styles.heroValue, { color: palette.text }]}>
              {loading ? '...' : formatMoney(summary.totalStockValueCents, currency)}
            </Text>
            <Text style={[styles.heroHint, { color: palette.textMuted }]}>
              {heroHint}
            </Text>
          </View>

          <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={palette.primary} />
          </View>
        </View>

        <View style={styles.heroBadges}>
          <StatusBadge
            tone="success"
            label={`${loading ? '—' : summary.activeProductsCount} ${t('home.products')}`}
          />
          <StatusBadge
            tone="warning"
            label={`${loading ? '—' : summary.lowStockCount} ${t('home.lowStock')}`}
          />
        </View>
      </AppCard>

      <View style={styles.metricRow}>
        <MetricCard
          compact
          label={t('home.products')}
          value={loading ? '—' : String(summary.activeProductsCount)}
          hint={t('home.updatedToday')}
        />
        <MetricCard
          compact
          label={t('home.lowStock')}
          value={loading ? '—' : String(summary.lowStockCount)}
          hint={t('home.alerts')}
        />
      </View>
      <View style={styles.metricRow}>
        <MetricCard
          compact
          label={t('home.zeroStock')}
          value={loading ? '—' : String(summary.zeroStockCount)}
          hint={t('home.alertsBody')}
        />
        <MetricCard
          compact
          label={t('home.expiringSoon')}
          value={loading ? '—' : String(summary.expiringSoonCount)}
          hint={t('home.alerts')}
        />
      </View>

      <AppCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>{t('home.quickActions')}</Text>
            <Text style={[styles.sectionBody, { color: palette.textMuted }]}>
              {t('home.offlineBadge')}
            </Text>
          </View>
          <Ionicons name="flash-outline" size={20} color={palette.primary} />
        </View>

        <AppButton
          label={t('home.addProduct')}
          onPress={() => router.push('/products/new')}
        />
        <AppButton
          label={t('home.makeMovement')}
          variant="secondary"
          onPress={() => router.push('/products/movement')}
        />
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>{t('home.recentMovements')}</Text>
            <Text style={[styles.sectionBody, { color: palette.textMuted }]}>
              {t('home.recentMovementsBody')}
            </Text>
          </View>
          <Ionicons name="time-outline" size={20} color={palette.primary} />
        </View>

        {error ? (
          <EmptyState
            title={t('home.noRecentMovements')}
            description={error}
            actionLabel={t('common.retry')}
            onActionPress={() => void refresh()}
          />
        ) : summary.lastMovements.length > 0 ? (
          <View style={styles.listGap}>
            {summary.lastMovements.map((movement) => (
              <AppCard.Row
                key={movement.id}
                icon={
                  movement.type === 'in'
                    ? 'arrow-up-outline'
                    : movement.type === 'out'
                      ? 'arrow-down-outline'
                      : movement.type === 'loss'
                        ? 'warning-outline'
                        : 'swap-horizontal-outline'
                }
                title={movement.productName}
                subtitle={`${getMovementLabel(movement.type, t)} • ${formatShortDateTime(movement.createdAt)}`}
                trailing={
                  <StatusBadge
                    tone={getMovementTone(movement.type)}
                    label={`x${movement.quantity}`}
                  />
                }
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title={t('home.noRecentMovements')}
            description={t('home.noRecentMovementsBody')}
          />
        )}
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>{t('home.alerts')}</Text>
            <Text style={[styles.sectionBody, { color: palette.textMuted }]}>
              {t('home.alertsBody')}
            </Text>
          </View>
          <Ionicons name="alert-circle-outline" size={20} color={palette.warning} />
        </View>

        {summary.zeroStockCount > 0 || summary.lowStockCount > 0 || summary.expiringSoonCount > 0 ? (
          <View style={styles.listGap}>
            {summary.zeroStockCount > 0 ? (
              <AppCard.Row
                icon="alert-circle-outline"
                title={t('home.zeroStock')}
                subtitle={`${summary.zeroStockCount} ${t('home.zeroStock')}`}
                trailing={<StatusBadge tone="danger" label="0" />}
              />
            ) : null}
            {summary.lowStockCount > 0 ? (
              <AppCard.Row
                icon="warning-outline"
                title={t('home.lowStock')}
                subtitle={`${summary.lowStockCount} ${t('home.lowStock')}`}
                trailing={<StatusBadge tone="warning" label={String(summary.lowStockCount)} />}
              />
            ) : null}
            {summary.expiringSoonCount > 0 ? (
              <AppCard.Row
                icon="calendar-outline"
                title={t('home.expiringSoon')}
                subtitle={`${summary.expiringSoonCount} ${t('home.expiringSoon')}`}
                trailing={<StatusBadge tone="info" label={String(summary.expiringSoonCount)} />}
              />
            ) : null}
          </View>
        ) : (
          <EmptyState title={t('home.noAlerts')} description={t('home.noAlertsBody')} />
        )}
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 18,
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
