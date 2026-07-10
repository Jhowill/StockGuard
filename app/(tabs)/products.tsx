import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

export default function ProductsScreen() {
  const { t } = useI18n();
  const { palette } = useAppTheme();
  const { products, query, setQuery, loading, error } = useProducts();
  const { categories } = useCategories();
  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  const lowStockCount = useMemo(() => products.filter((product) => product.quantity <= product.minQuantity).length, [products]);

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        actionLabel="+"
        onActionPress={() => router.push('/products/new')}
      />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="cube-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Lista compacta para navegar rapido</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>Busque, confira saldos e abra o detalhe do produto em poucos toques.</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label={`${products.length} itens`} />
          <StatusBadge tone={lowStockCount > 0 ? 'warning' : 'success'} label={`${lowStockCount} baixo estoque`} />
        </View>
      </AppCard>

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
