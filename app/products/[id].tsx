import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { MetricCard } from '@/components/ui/MetricCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { archiveProduct } from '@/database/repositories/productRepository';
import { useCategories } from '@/hooks/useCategories';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAppState } from '@/state/app-state';
import { useI18n } from '@/hooks/useI18n';
import { formatMoney } from '@/utils/format';
import { formatShortDateTime } from '@/utils/date-format';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const { currency } = useAppState();
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
        <EmptyState title={t('productDetail.title')} description="..." icon="cube-outline" />
      </ScreenContainer>
    );
  }

  if (error || !product) {
    return (
      <ScreenContainer padded>
        <AppHeader title={t('productDetail.title')} subtitle={t('products.emptyTitle')} />
        <EmptyState
          title={t('products.emptyTitle')}
          description={error ?? t('products.emptyBody')}
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
      <AppHeader title={t('productDetail.title')} subtitle={product.name} />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Row
          icon="cube-outline"
          title={product.name}
          subtitle={categoryNames.get(product.categoryId ?? '') ?? product.location ?? product.unit}
          trailing={<StatusBadge tone={stockTone} label={product.status} />}
        />
        <AppCard.Text>{product.notes ?? t('home.noAlertsBody')}</AppCard.Text>
        <AppCard.Text>
          Categoria: {categoryNames.get(product.categoryId ?? '') ?? 'Sem categoria'}
        </AppCard.Text>
        <AppCard.Text>
          Fornecedor: {supplierNames.get(product.supplierId ?? '') ?? 'Sem fornecedor'}
        </AppCard.Text>
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
        <AppCard.Title>{t('home.recentMovements')}</AppCard.Title>
        {movements.length > 0 ? (
          movements.map((movement) => (
            <AppCard.Row
              key={movement.id}
              icon={movement.type === 'in' ? 'arrow-up-outline' : movement.type === 'out' ? 'arrow-down-outline' : 'swap-horizontal-outline'}
              title={movement.reason}
              subtitle={formatShortDateTime(movement.createdAt)}
              trailing={<StatusBadge tone={movement.type === 'in' ? 'success' : movement.type === 'out' ? 'warning' : 'info'} label={String(movement.quantity)} />}
            />
          ))
        ) : (
          <EmptyState title={t('home.noRecentMovements')} description={t('home.noRecentMovementsBody')} />
        )}
      </AppCard>

      {actionError ? <EmptyState title={t('productDetail.title')} description={actionError} /> : null}

      <AppButton label={t('productDetail.move')} onPress={() => router.push({ pathname: '/products/movement', params: { productId: product.id } })} />
      <AppButton label={t('productDetail.edit')} variant="secondary" onPress={() => router.push({ pathname: '/products/edit', params: { id: product.id } })} />
      <AppButton
        label={t('common.archive')}
        variant="danger"
        disabled={busy}
        onPress={() => setConfirmArchive(true)}
      />

      <ConfirmDialog
        visible={confirmArchive}
        title="Arquivar produto?"
        message="O produto vai sair das listas principais, mas o historico e a auditoria continuam disponiveis."
        confirmLabel="Arquivar"
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
            setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel arquivar o produto.');
          } finally {
            setBusy(false);
          }
        }}
      />
    </ScreenContainer>
  );
}
