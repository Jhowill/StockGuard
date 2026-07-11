import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { MetricCard } from '@/components/ui/MetricCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { archiveProduct } from '@/database/repositories/productRepository';
import { useCategories } from '@/hooks/useCategories';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppState } from '@/state/app-state';
import { useI18n } from '@/hooks/useI18n';
import { translateAppError } from '@/i18n/errorMessages';
import { formatMoney } from '@/utils/format';
import { formatShortDateTime } from '@/utils/date-format';

function getStatusLabel(status: string, t: (key: string) => string) {
  switch (status) {
    case 'active':
      return t('common.active');
    case 'archived':
      return t('common.archived');
    default:
      return status;
  }
}

function getMovementReasonLabel(reason: string, t: (key: string) => string) {
  switch (reason) {
    case 'initial_setup':
      return t('movement.reasonInitialSetup');
    case 'restore':
      return t('movement.reasonRestore');
    case 'other':
      return t('movement.reasonOther');
    default:
      return reason;
  }
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useI18n();
  const { currency, hideFinancialValues } = useAppState();
  const { palette } = useAppTheme();
  const { categories } = useCategories();
  const { suppliers } = useSuppliers();
  const productId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const { product, movements, loading, error } = useProductDetail(productId);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  const supplierNames = useMemo(() => new Map(suppliers.map((supplier) => [supplier.id, supplier.name])), [suppliers]);

  if (loading) {
    return (
      <ScreenContainer padded>
        <LoadingState title={t('productDetail.title')} description={t('common.loading')} />
      </ScreenContainer>
    );
  }

  if (error || !product) {
    return (
      <ScreenContainer padded>
        <AppHeader title={t('productDetail.title')} subtitle={t('products.emptyTitle')} variant="page" onBackPress={() => router.back()} />
        <EmptyState
          title={t('products.emptyTitle')}
          description={translateAppError(error, t) || t('products.emptyBody')}
          icon="cube-outline"
          actionLabel={t('common.back')}
          onActionPress={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const stockTone =
    product.quantity === 0 ? 'danger' : product.quantity <= product.minQuantity ? 'warning' : 'success';

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('productDetail.title')} subtitle={product.name} variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        {product.imageUri ? (
          <Image source={{ uri: product.imageUri }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder, { backgroundColor: palette.background }]}>
            <Ionicons name="cube-outline" size={42} color={palette.primary} />
            <Text style={[styles.heroPlaceholderTitle, { color: palette.text }]}>{t('productDetail.noImage')}</Text>
            <Text style={[styles.heroPlaceholderText, { color: palette.textMuted }]}>{t('productDetail.noImageBody')}</Text>
            <AppButton label={t('productDetail.edit')} variant="secondary" onPress={() => router.push({ pathname: '/products/edit', params: { id: product.id } })} />
          </View>
        )}

          <View style={styles.heroBody}>
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <Text style={[styles.heroLabel, { color: palette.textMuted }]}>{t('productDetail.product')}</Text>
                <Text style={[styles.heroTitle, { color: palette.text }]}>{product.name}</Text>
                <Text style={[styles.heroSubtitle, { color: palette.textMuted }]}>
                  {categoryNames.get(product.categoryId ?? '') ?? product.location ?? product.unit}
                </Text>
              </View>
              <StatusBadge tone={stockTone} label={getStatusLabel(product.status, t)} />
            </View>

            <View style={styles.heroMeta}>
              <StatusBadge tone="info" label={product.unit} />
              <StatusBadge tone="success" label={product.sku ?? t('common.noSku')} />
            </View>
          <AppCard.Text>{product.description ?? product.notes ?? t('productDetail.noNotes')}</AppCard.Text>
        </View>
      </AppCard>

      <View style={styles.metricsGrid}>
        <View style={styles.metricsRow}>
          <MetricCard compact label={t('productDetail.quantity')} value={String(product.quantity)} />
          <MetricCard compact label={t('productDetail.minQuantity')} value={String(product.minQuantity)} />
        </View>
        <View style={styles.metricsRow}>
          <MetricCard
            compact
            label={t('productNew.cost')}
            value={hideFinancialValues ? '••••••' : formatMoney(product.costPriceCents ?? 0, currency, language)}
          />
          <MetricCard
            compact
            label={t('productNew.sale')}
            value={hideFinancialValues ? '••••••' : formatMoney(product.salePriceCents ?? 0, currency, language)}
          />
        </View>
        <View style={styles.metricsRow}>
          <MetricCard
            compact
            label={t('productDetail.value')}
            value={hideFinancialValues ? '••••••' : formatMoney((product.quantity || 0) * (product.costPriceCents ?? 0), currency, language)}
          />
          <MetricCard compact label={t('productDetail.location')} value={product.location ?? t('common.noLocation')} />
        </View>
      </View>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Row
          icon="information-circle-outline"
          title={t('productDetail.details')}
          subtitle={t('productDetail.categoryLine', { value: categoryNames.get(product.categoryId ?? '') ?? t('common.noCategory') })}
        />
        {product.description ? <AppCard.Text>{product.description}</AppCard.Text> : null}
        <AppCard.Text>{t('productDetail.supplierLine', { value: supplierNames.get(product.supplierId ?? '') ?? t('common.noSupplier') })}</AppCard.Text>
        <AppCard.Text>{t('productDetail.skuLine', { value: product.sku ?? t('common.noSku') })}</AppCard.Text>
        <AppCard.Text>{t('productDetail.locationLine', { value: product.location ?? t('common.noLocation') })}</AppCard.Text>
        <AppCard.Text>{t('productDetail.expirationLine', { value: product.expirationDate ?? t('productDetail.noExpiration') })}</AppCard.Text>
        <AppCard.Text>{t('productDetail.batchLine', { value: product.batchCode ?? t('productDetail.noBatch') })}</AppCard.Text>
      </AppCard>

      <View style={styles.actionsGrid}>
        <View style={styles.actionsRow}>
          <AppButton label={t('productDetail.move')} style={styles.flexAction} onPress={() => router.push({ pathname: '/products/movement', params: { productId: product.id } })} />
          <AppButton label={t('productDetail.edit')} variant="secondary" style={styles.flexAction} onPress={() => router.push({ pathname: '/products/edit', params: { id: product.id } })} />
        </View>
        <AppButton
          label={t('common.archive')}
          variant="danger"
          disabled={busy}
          onPress={() => setConfirmArchive(true)}
        />
      </View>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('home.recentMovements')}</AppCard.Title>
        {movements.length > 0 ? (
          movements.map((movement) => (
            <AppCard.Row
              key={movement.id}
              icon={movement.type === 'in' ? 'arrow-up-outline' : movement.type === 'out' ? 'arrow-down-outline' : 'swap-horizontal-outline'}
              title={getMovementReasonLabel(movement.reason, t)}
              subtitle={formatShortDateTime(movement.createdAt, language)}
              trailing={<StatusBadge tone={movement.type === 'in' ? 'success' : movement.type === 'out' ? 'warning' : 'info'} label={String(movement.quantity)} />}
            />
          ))
        ) : (
          <EmptyState title={t('home.noRecentMovements')} description={t('home.noRecentMovementsBody')} />
        )}
      </AppCard>

      {actionError ? <EmptyState title={t('productDetail.title')} description={translateAppError(actionError, t)} /> : null}

      <ConfirmDialog
        visible={confirmArchive}
        title={t('productDetail.archiveTitle')}
        message={t('productDetail.archiveBody')}
        confirmLabel={t('common.archive')}
        danger
        onCancel={() => setConfirmArchive(false)}
        onConfirm={async () => {
          setBusy(true);
          setActionError(undefined);
          setConfirmArchive(false);
          try {
            await archiveProduct(product.id);
            router.replace('/(tabs)/products');
          } catch (nextError) {
            setActionError(nextError instanceof Error ? nextError.message : t('productDetail.archiveFailed'));
          } finally {
            setBusy(false);
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 0,
    padding: 0,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  heroBody: {
    gap: 14,
    padding: 16,
  },
  heroPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  heroPlaceholderText: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metricsGrid: {
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionsGrid: {
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexAction: {
    flex: 1,
  },
});
