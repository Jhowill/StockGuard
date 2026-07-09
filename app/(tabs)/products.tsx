import { router } from 'expo-router';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProducts } from '@/hooks/useProducts';
import { useI18n } from '@/hooks/useI18n';

export default function ProductsScreen() {
  const { t } = useI18n();
  const { products, query, setQuery, loading, error } = useProducts();

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        actionLabel="+"
        onActionPress={() => router.push('/products/new')}
      />

      <AppInput
        placeholder={t('products.searchPlaceholder')}
        value={query}
        onChangeText={setQuery}
      />

      {loading ? (
        <EmptyState title={t('products.emptyTitle')} description={t('products.emptyBody')} />
      ) : error ? (
        <EmptyState title={t('products.emptyTitle')} description={error} />
      ) : products.length === 0 ? (
        <EmptyState
          title={t('products.emptyTitle')}
          description={t('products.emptyBody')}
          actionLabel={t('products.addFirst')}
          onActionPress={() => router.push('/products/new')}
        />
      ) : (
        products.map((product) => (
          <AppCard key={product.id} onPress={() => router.push(`/products/${product.id}`)}>
            <AppCard.Row
              icon="cube-outline"
              title={product.name}
              subtitle={product.categoryId ?? product.location ?? product.unit}
              trailing={
                <StatusBadge
                  tone={product.quantity <= product.minQuantity ? 'warning' : 'success'}
                  label={`${product.quantity}`}
                />
              }
            />
          </AppCard>
        ))
      )}
    </ScreenContainer>
  );
}
