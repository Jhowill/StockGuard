import { useLocalSearchParams, router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { demoProducts } from '@/data/demo';
import { useI18n } from '@/hooks/useI18n';
import { useAppState } from '@/state/app-state';
import { formatMoney } from '@/utils/format';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const { currency } = useAppState();
  const product = demoProducts.find((item) => item.id === id) ?? demoProducts[0];

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('productDetail.title')} subtitle={product.name} />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Row
          icon={product.icon}
          title={product.name}
          subtitle={product.category}
          trailing={<StatusBadge tone={product.tone} label={product.status} />}
        />
      </AppCard>

      <AppCard style={{ flexDirection: 'row', gap: 12 }}>
        <MetricCard compact label={t('productDetail.quantity')} value={product.quantityLabel} />
        <MetricCard compact label={t('productDetail.minQuantity')} value={product.minQuantity} />
      </AppCard>

      <AppCard style={{ flexDirection: 'row', gap: 12 }}>
        <MetricCard compact label={t('productDetail.value')} value={formatMoney(product.valueCents, currency)} />
        <MetricCard compact label={t('productDetail.location')} value={product.location} />
      </AppCard>

      <AppButton label={t('productDetail.move')} onPress={() => router.push('/products/movement')} />
      <AppButton label={t('productDetail.edit')} variant="secondary" onPress={() => router.push('/products/new')} />
    </ScreenContainer>
  );
}
