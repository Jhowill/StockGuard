import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useI18n } from '@/hooks/useI18n';

type ProductFilter = 'all' | 'low' | 'zero' | 'expiring';

const filterOptions: Array<{ value: ProductFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'low', label: 'Baixo estoque' },
  { value: 'zero', label: 'Zerados' },
  { value: 'expiring', label: 'Vencendo' },
];

function isProductExpiring(expirationDate?: string | null) {
  if (!expirationDate) {
    return false;
  }

  const date = new Date(expirationDate);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);
  return date.getTime() <= sevenDaysFromNow.getTime();
}

function normalizeFilter(value: unknown): ProductFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'low' || raw === 'zero' || raw === 'expiring' ? raw : 'all';
}

export default function ProductsScreen() {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const { t } = useI18n();
  const { palette } = useAppTheme();
  const { products, query, setQuery, loading, error } = useProducts();
  const { categories } = useCategories();
  const [activeFilter, setActiveFilter] = useState<ProductFilter>(() => normalizeFilter(filter));
  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  const lowStockCount = useMemo(() => products.filter((product) => product.quantity <= product.minQuantity).length, [products]);
  const zeroStockCount = useMemo(() => products.filter((product) => product.quantity === 0).length, [products]);
  const expiringCount = useMemo(() => products.filter((product) => isProductExpiring(product.expirationDate)).length, [products]);
  const filteredProducts = useMemo(() => {
    switch (activeFilter) {
      case 'low':
        return products.filter((product) => product.quantity <= product.minQuantity);
      case 'zero':
        return products.filter((product) => product.quantity === 0);
      case 'expiring':
        return products.filter((product) => isProductExpiring(product.expirationDate));
      default:
        return products;
    }
  }, [activeFilter, products]);
  const selectedFilterLabel = filterOptions.find((item) => item.value === activeFilter)?.label ?? 'Todos';

  useEffect(() => {
    setActiveFilter(normalizeFilter(filter));
  }, [filter]);

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title={t('products.title')}
        subtitle={activeFilter === 'all' ? t('products.subtitle') : `Filtro ativo: ${selectedFilterLabel}`}
        actionLabel="+"
        onActionPress={() => router.push('/products/new')}
      />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="cube-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Lista compacta para navegar rapido</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>Busque, filtre e abra o detalhe do produto em poucos toques.</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label={`${products.length} itens`} />
          <StatusBadge tone={lowStockCount > 0 ? 'warning' : 'success'} label={`${lowStockCount} baixo estoque`} />
        </View>
      </AppCard>

      <AppInput
        placeholder={t('products.searchPlaceholder')}
        helperText="Busque por nome, SKU, codigo de barras ou localizacao."
        value={query}
        onChangeText={setQuery}
      />

      <AppCard style={styles.filterCard}>
        <AppCard.Title>Filtros rapidos</AppCard.Title>
        <View style={styles.filterRow}>
          {filterOptions.map((item) => (
            <AppButton
              key={item.value}
              label={item.label}
              variant={activeFilter === item.value ? 'primary' : 'secondary'}
              style={styles.filterButton}
              onPress={() => setActiveFilter(item.value)}
            />
          ))}
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="danger" label={`${zeroStockCount} zerados`} />
          <StatusBadge tone="warning" label={`${lowStockCount} baixos`} />
          <StatusBadge tone="info" label={`${expiringCount} vencendo`} />
        </View>
      </AppCard>

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
      ) : filteredProducts.length === 0 ? (
        <EmptyState title="Nenhum item neste filtro" description="Troque o filtro ou ajuste a busca para ver outros produtos." icon="filter-outline" />
      ) : (
        filteredProducts.map((product) => (
          <AppCard key={product.id} onPress={() => router.push(`/products/${product.id}`)}>
            <AppCard.Row
              icon="cube-outline"
              title={product.name}
              subtitle={categoryNames.get(product.categoryId ?? '') ?? product.location ?? product.unit}
              trailing={
                <StatusBadge
                  tone={product.quantity === 0 ? 'danger' : product.quantity <= product.minQuantity ? 'warning' : 'success'}
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
  filterCard: {
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterButton: {
    flexGrow: 1,
  },
});
