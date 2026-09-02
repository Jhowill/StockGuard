import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MovementTypePicker } from '@/components/movement/MovementTypePicker';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppModalSelect } from '@/components/ui/AppModalSelect';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useCategories } from '@/hooks/useCategories';
import { useI18n } from '@/hooks/useI18n';
import { useProducts } from '@/hooks/useProducts';
import { createStockMovement } from '@/services/stockMovementService';
import type { StockMovementType } from '@/types/stock';
import { parsePositiveNumber } from '@/utils/validators';

function getMovementDirection(type: StockMovementType) {
  return type === 'in' || type === 'return' || type === 'adjustment_positive' ? 1 : -1;
}

function getMovementActionKey(type: StockMovementType) {
  switch (type) {
    case 'in':
      return 'movement.actionReceive';
    case 'return':
      return 'movement.actionReturn';
    case 'loss':
      return 'movement.actionLoss';
    case 'adjustment_positive':
      return 'movement.actionUp';
    case 'adjustment_negative':
      return 'movement.actionDown';
    default:
      return 'movement.actionOut';
  }
}

const movementLabelKeys: Record<StockMovementType, string> = {
  in: 'movement.entry',
  out: 'movement.exit',
  loss: 'movement.loss',
  return: 'movement.return',
  adjustment_positive: 'movement.adjustmentPositive',
  adjustment_negative: 'movement.adjustmentNegative',
  initial_balance: 'movement.initialBalance',
};

function getUnitSuffix(unit: string) {
  switch (unit) {
    case 'unit':
      return 'un';
    case 'box':
      return 'cx';
    case 'pack':
      return 'pct';
    case 'pair':
      return 'par';
    case 'service_item':
      return 'srv';
    default:
      return unit;
  }
}

export default function MovementScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const initialProductId = useMemo(() => (Array.isArray(productId) ? productId[0] : productId) ?? '', [productId]);
  const { t } = useI18n();
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  const [type, setType] = useState<StockMovementType>('in');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [confirmSave, setConfirmSave] = useState(false);

  useEffect(() => {
    setSelectedProductId(initialProductId);
  }, [initialProductId]);

  const quantityToMove = parsePositiveNumber(quantity);
  const selectedProduct = useMemo(() => products.find((product) => product.id === selectedProductId), [products, selectedProductId]);
  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  const productOptions = useMemo(
    () => products.map((product) => ({
      value: product.id,
      label: product.name,
      description: `${categoryNames.get(product.categoryId ?? '') ?? t('common.noCategory')} - ${product.quantity} ${getUnitSuffix(product.unit)}`,
    })),
    [categoryNames, products, t],
  );
  const direction = getMovementDirection(type);
  const movementImpact = direction * quantityToMove;
  const resultingQuantity = selectedProduct ? selectedProduct.quantity + movementImpact : null;
  const canSave = Boolean(selectedProduct && quantityToMove > 0 && !saving && (resultingQuantity == null || resultingQuantity >= 0));

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!selectedProduct || !canSave) {
      setError(resultingQuantity != null && resultingQuantity < 0 ? t('movement.insufficient') : t('movement.invalid'));
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      await createStockMovement({
        productId: selectedProduct.id,
        type,
        reason: reason.trim() || 'other',
        quantity: quantityToMove,
        note: notes.trim() || undefined,
        currency: selectedProduct.currency,
      });
      router.replace(`/products/${selectedProduct.id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t('movement.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title={t('movement.title')}
        subtitle={t('movement.subtitle')}
        variant="page"
        onBackPress={() => router.back()}
      />

      {loading ? (
        <LoadingState title={t('products.title')} description={t('common.loading')} />
      ) : products.length === 0 ? (
        <EmptyState
          title={t('products.title')}
          description={t('products.emptyTitle')}
          icon="cube-outline"
          actionLabel={t('products.addFirst')}
          onActionPress={() => router.push('/products/new')}
        />
      ) : (
        <>
          <AppCard style={{ gap: 12 }}>
            <AppCard.Title>{t('movement.productStep')}</AppCard.Title>
            <AppCard.Text>{t('movement.productStepBody')}</AppCard.Text>
            <AppModalSelect
              label={selectedProduct ? t('movement.changeProduct') : t('movement.chooseProduct')}
              placeholder={t('movement.chooseProduct')}
              helperText={selectedProduct ? `${selectedProduct.name} - ${categoryNames.get(selectedProduct.categoryId ?? '') ?? t('common.noCategory')}` : t('movement.productStepBody')}
              value={selectedProductId}
              options={productOptions}
              onChange={setSelectedProductId}
              searchable
              searchPlaceholder={t('products.searchPlaceholder')}
            />
            {selectedProduct ? (
              <AppCard variant="hero" style={styles.selectedProductCard}>
                <AppCard.Row
                  icon="cube-outline"
                  title={selectedProduct.name}
                  subtitle={categoryNames.get(selectedProduct.categoryId ?? '') ?? selectedProduct.unit}
                  trailing={
                    <StatusBadge
                      tone={selectedProduct.quantity === 0 ? 'danger' : selectedProduct.quantity <= selectedProduct.minQuantity ? 'warning' : 'success'}
                      label={`${selectedProduct.quantity} ${getUnitSuffix(selectedProduct.unit)}`}
                    />
                  }
                />
                <View style={styles.summaryMeta}>
                  <StatusBadge tone="info" label={`${t('productDetail.minQuantity')}: ${selectedProduct.minQuantity}`} />
                  <StatusBadge tone="success" label={selectedProduct.location ?? t('common.noLocation')} />
                </View>
              </AppCard>
            ) : null}
          </AppCard>

          <MovementTypePicker value={type} onChange={setType} />
        </>
      )}

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('movement.quantityDetails')}</AppCard.Title>
        <AppInput
          inputSize="large"
          helperText={t('productNew.decimalHelper')}
          label={t('movement.quantity')}
          placeholder="0"
          keyboardType="decimal-pad"
          mask="decimal"
          maskOptions={{ maxFractionDigits: 3 }}
          value={quantity}
          onChangeText={setQuantity}
          suffix={selectedProduct ? getUnitSuffix(selectedProduct.unit) : undefined}
        />
        <AppInput label={t('movement.reason')} placeholder={t('movement.reasonPlaceholder')} value={reason} onChangeText={setReason} />
        <AppInput inputSize="large" label={t('movement.notes')} placeholder={t('movement.notesPlaceholder')} multiline value={notes} onChangeText={setNotes} />
      </AppCard>

      {selectedProduct ? (
        <AppCard variant="hero" style={styles.summaryCard}>
          <AppCard.Title>{t('movement.preview')}</AppCard.Title>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBlock}>
              <AppCard.Text>{t('movement.current')}</AppCard.Text>
              <StatusBadge tone="info" label={String(selectedProduct.quantity)} />
            </View>
            <View style={styles.summaryBlock}>
              <AppCard.Text>{t('movement.change')}</AppCard.Text>
              <StatusBadge tone={movementImpact >= 0 ? 'success' : 'warning'} label={`${movementImpact >= 0 ? '+' : ''}${quantityToMove}`} />
            </View>
            <View style={styles.summaryBlock}>
              <AppCard.Text>{t('movement.newBalance')}</AppCard.Text>
              <StatusBadge
                tone={resultingQuantity != null && resultingQuantity < selectedProduct.quantity ? 'warning' : 'success'}
                label={String(resultingQuantity ?? selectedProduct.quantity)}
              />
            </View>
          </View>
          <AppCard.Text>{t('movement.selectedType', { type: t(movementLabelKeys[type]) })}</AppCard.Text>
          <AppCard.Text>
            {t('movement.impactText', { product: selectedProduct.name, action: t(getMovementActionKey(type)), quantity: quantityToMove, unit: getUnitSuffix(selectedProduct.unit) })}
          </AppCard.Text>
        </AppCard>
      ) : null}

      {error ? (
        <AppCard>
          <AppCard.Text>{error}</AppCard.Text>
        </AppCard>
      ) : null}

      <AppButton label={t('movement.save')} loading={saving} disabled={!canSave} onPress={() => setConfirmSave(true)} />

      <ConfirmDialog
        visible={confirmSave}
        title={t('movement.confirmTitle')}
        message={t('movement.confirmBody')}
        confirmLabel={t('common.save')}
        onCancel={() => setConfirmSave(false)}
        onConfirm={async () => {
          setConfirmSave(false);
          await handleSave();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  selectedProductCard: {
    gap: 12,
  },
  summaryMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryCard: {
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  summaryBlock: {
    flex: 1,
    minWidth: 88,
    gap: 6,
  },
});
