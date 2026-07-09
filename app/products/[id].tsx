import { useLocalSearchParams, router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { MetricCard } from '@/components/ui/MetricCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useAppState } from '@/state/app-state';
import { useI18n } from '@/hooks/useI18n';
import { formatMoney } from '@/utils/format';
import { formatShortDateTime } from '@/utils/date-format';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const { currency } = useAppState();
  const { product, movements, loading, error } = useProductDetail(id);

  if (loading) {
    return (
      <ScreenContainer padded>
        <EmptyState title={t('productDetail.title')} description="..." />
      </ScreenContainer>
    );
  }

  if (error || !product) {
    return (
      <ScreenContainer padded>
        <AppHeader title={t('productDetail.title')} subtitle={t('products.emptyTitle')} />
        <EmptyState title={t('products.emptyTitle')} description={error ?? t('products.emptyBody')} actionLabel={t('common.back')} onActionPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  const statusTone =
    product.quantity === 0 ? 'danger' : product.quantity <= product.minQuantity ? 'warning' : 'success';

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('productDetail.title')} subtitle={product.name} />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Row
          icon="cube-outline"
          title={product.name}
          subtitle={product.categoryId ?? product.location ?? product.unit}
          trailing={<StatusBadge tone={statusTone} label={product.status} />}
        />
      </AppCard>

      <AppCard style={{ flexDirection: 'row', gap: 12 }}>
        <MetricCard compact label={t('productDetail.quantity')} value={String(product.quantity)} />
        <MetricCard compact label={t('productDetail.minQuantity')} value={String(product.minQuantity)} />
      </AppCard>

      <AppCard style={{ flexDirection: 'row', gap: 12 }}>
        <MetricCard compact label={t('productDetail.value')} value={formatMoney((product.quantity || 0) * (product.costPriceCents ?? 0), currency)} />
        <MetricCard compact label={t('productDetail.location')} value={product.location ?? '-'} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('productDetail.title')}</AppCard.Title>
        <AppCard.Text>{movements.length > 0 ? t('home.recentMovements') : t('home.noAlertsBody')}</AppCard.Text>
        {movements.length > 0 ? (
          movements.map((movement) => (
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

      <AppButton label={t('productDetail.move')} onPress={() => router.push('/products/movement')} />
      <AppButton label={t('productDetail.edit')} variant="secondary" onPress={() => router.push('/products/new')} />
    </ScreenContainer>
  );
}
