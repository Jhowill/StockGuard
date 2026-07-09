import { router } from 'expo-router';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { demoProducts } from '@/data/demo';
import { useI18n } from '@/hooks/useI18n';

export default function ProductsScreen() {
  const { t } = useI18n();

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        actionLabel="+"
        onActionPress={() => router.push('/products/new')}
      />

      <AppInput placeholder={t('products.searchPlaceholder')} />

      {demoProducts.length === 0 ? (
        <EmptyState
          title={t('products.emptyTitle')}
          description={t('products.emptyBody')}
          actionLabel={t('products.addFirst')}
          onActionPress={() => router.push('/products/new')}
        />
      ) : (
        demoProducts.map((product) => (
          <AppCard key={product.id} onPress={() => router.push(`/products/${product.id}`)}>
            <AppCard.Row
              icon={product.icon}
              title={product.name}
              subtitle={product.category}
              trailing={<StatusBadge tone={product.tone} label={product.quantityLabel} />}
            />
          </AppCard>
        ))
      )}
    </ScreenContainer>
  );
}
