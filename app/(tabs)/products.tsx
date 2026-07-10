import { router } from 'expo-router';
import { useMemo } from 'react';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useI18n } from '@/hooks/useI18n';

export default function ProductsScreen() {
  const { t } = useI18n();
  const { products, query, setQuery, loading, error } = useProducts();
  const { categories } = useCategories();
  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        actionLabel="Novo"
        onActionPress={() => router.push('/products/new')}
      />

      <AppInput
        placeholder={t('products.searchPlaceholder')}
        helperText="Busque por nome, SKU, código de barras ou localização."
        value={query}
        onChangeText={setQuery}
      />

      {loading ? (
        <EmptyState title={t('products.emptyTitle')} description={t('products.emptyBody')} icon="cube-outline" />
      ) : error ? (
        <EmptyState title={t('products.emptyTitle')} description={error} icon="cube-outline" />
      ) : products.length === 0 ? (
        <EmptyState
          title={t('products.emptyTitle')}
          description={t('products.emptyBody')}
          icon="cube-outline"
          actionLabel={t('products.addFirst')}
          onActionPress={() => router.push('/products/new')}
        />
      ) : (
        products.map((product) => (
          <AppCard key={product.id} onPress={() => router.push(`/products/${product.id}`)}>
            <AppCard.Row
              icon="cube-outline"
              title={product.name}
              subtitle={categoryNames.get(product.categoryId ?? '') ?? product.location ?? product.unit}
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
