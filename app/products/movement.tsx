import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdPolicyNotice } from '@/components/ads/AdPolicyNotice';
import { createStockMovement } from '@/services/stockMovementService';
import { showRequiredStockSaveInterstitial } from '@/services/adsService';
import { useProducts } from '@/hooks/useProducts';
import { useAppState } from '@/state/app-state';
import { useI18n } from '@/hooks/useI18n';
import type { StockMovementType } from '@/types/stock';
import { parsePositiveNumber } from '@/utils/validators';

const movementTypes: Array<{ value: StockMovementType; label: string }> = [
  { value: 'in', label: 'Entrada' },
  { value: 'out', label: 'Saida' },
  { value: 'return', label: 'Devolucao' },
  { value: 'loss', label: 'Perda' },
  { value: 'adjustment_positive', label: 'Ajuste +' },
  { value: 'adjustment_negative', label: 'Ajuste -' },
];

export default function MovementScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const initialProductId = useMemo(() => (Array.isArray(productId) ? productId[0] : productId) ?? '', [productId]);
  const { t } = useI18n();
  const { currency } = useAppState();
  const { products, loading } = useProducts();
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
  const resultingQuantity = selectedProduct
    ? type === 'in' || type === 'return' || type === 'adjustment_positive'
      ? selectedProduct.quantity + quantityToMove
      : selectedProduct.quantity - quantityToMove
    : null;

  const canSave = Boolean(selectedProduct && quantityToMove > 0 && !saving && (resultingQuantity == null || resultingQuantity >= 0));

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!selectedProduct || !canSave) {
      setError(resultingQuantity != null && resultingQuantity < 0 ? 'Saldo insuficiente para essa saida.' : 'Selecione um produto e informe uma quantidade valida.');
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      const adResult = await showRequiredStockSaveInterstitial();
      if (adResult.status !== 'success') {
        throw new Error(adResult.status === 'cancelled' ? 'Assista ao anuncio ate o final para salvar o estoque.' : adResult.reason);
      }

      await createStockMovement({
        productId: selectedProduct.id,
        type,
        reason: reason.trim() || 'other',
        quantity: quantityToMove,
        note: notes.trim() || undefined,
        currency,
      });
      router.replace(`/products/${selectedProduct.id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Nao foi possivel salvar a movimentacao.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('movement.title')} subtitle={t('movement.subtitle')} />

      <AdPolicyNotice
        title={t('ads.requiredTitle')}
        body={t('ads.requiredBody')}
        icon="alert-circle-outline"
        tone="required"
      />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Produto</AppCard.Title>
        {loading ? (
          <EmptyState title="Produtos" description="Carregando..." />
        ) : products.length === 0 ? (
          <EmptyState title="Produtos" description="Nenhum produto cadastrado." actionLabel="Adicionar produto" onActionPress={() => router.push('/products/new')} />
        ) : (
          products.map((product) => (
            <AppCard
              key={product.id}
              onPress={() => setSelectedProductId(product.id)}
              variant={selectedProductId === product.id ? 'hero' : 'default'}
            >
              <AppCard.Row
                icon="cube-outline"
                title={product.name}
                subtitle={product.categoryId ?? product.unit}
                trailing={<StatusBadge tone={product.quantity === 0 ? 'danger' : product.quantity <= product.minQuantity ? 'warning' : 'success'} label={String(product.quantity)} />}
              />
            </AppCard>
          ))
        )}
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Tipo</AppCard.Title>
        {movementTypes.map((item) => (
          <AppButton key={item.value} label={item.label} variant={type === item.value ? 'primary' : 'ghost'} onPress={() => setType(item.value)} />
        ))}
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppInput label="Quantidade" placeholder="0" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
        <AppInput label="Motivo" placeholder="Selecione uma categoria" value={reason} onChangeText={setReason} />
        <AppInput label="Observacao" placeholder="Digite uma observacao" multiline value={notes} onChangeText={setNotes} />
      </AppCard>

      {selectedProduct ? (
        <AppCard>
          <AppCard.Text>
            {selectedProduct.name} | atual {selectedProduct.quantity} | novo{' '}
            {type === 'in' || type === 'return' || type === 'adjustment_positive'
              ? selectedProduct.quantity + quantityToMove
              : selectedProduct.quantity - quantityToMove}
          </AppCard.Text>
        </AppCard>
      ) : null}

      {error ? (
        <AppCard>
          <AppCard.Text>{error}</AppCard.Text>
        </AppCard>
      ) : null}

      <AppButton label={saving ? '...' : 'Salvar'} disabled={!canSave} onPress={() => setConfirmSave(true)} />
      <AppButton label="Voltar" variant="ghost" onPress={() => router.back()} />

      <ConfirmDialog
        visible={confirmSave}
        title="Confirmar movimentacao?"
        message="Revise o tipo, a quantidade e o impacto no saldo antes de gravar. O anuncio obrigatorio precisa terminar para concluir o salvamento."
        confirmLabel="Salvar"
        onCancel={() => setConfirmSave(false)}
        onConfirm={async () => {
          setConfirmSave(false);
          await handleSave();
        }}
      />
    </ScreenContainer>
  );
}
