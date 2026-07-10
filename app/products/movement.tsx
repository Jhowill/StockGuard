import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MovementTypePicker } from '@/components/movement/MovementTypePicker';
import { AdPolicyNotice } from '@/components/ads/AdPolicyNotice';
import { createStockMovement } from '@/services/stockMovementService';
import { showRequiredStockSaveInterstitial } from '@/services/adsService';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useAppState } from '@/state/app-state';
import { useI18n } from '@/hooks/useI18n';
import { parsePositiveNumber } from '@/utils/validators';
import type { StockMovementType } from '@/types/stock';

function getMovementDirection(type: StockMovementType) {
  return type === 'in' || type === 'return' || type === 'adjustment_positive' ? 1 : -1;
}

const movementLabels: Record<StockMovementType, string> = {
  in: 'Entrada',
  out: 'Saída',
  loss: 'Perda',
  return: 'Devolução',
  adjustment_positive: 'Ajuste +',
  adjustment_negative: 'Ajuste -',
  initial_balance: 'Saldo inicial',
};

export default function MovementScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const initialProductId = useMemo(() => (Array.isArray(productId) ? productId[0] : productId) ?? '', [productId]);
  const { t } = useI18n();
  const { currency } = useAppState();
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
  const direction = getMovementDirection(type);
  const movementImpact = direction * quantityToMove;
  const resultingQuantity = selectedProduct ? selectedProduct.quantity + movementImpact : null;

  const canSave = Boolean(selectedProduct && quantityToMove > 0 && !saving && (resultingQuantity == null || resultingQuantity >= 0));

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!selectedProduct || !canSave) {
      setError(resultingQuantity != null && resultingQuantity < 0 ? 'Saldo insuficiente para essa saída.' : 'Selecione um produto e informe uma quantidade válida.');
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
      setError(nextError instanceof Error ? nextError.message : 'Não foi possível salvar a movimentação.');
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
          <EmptyState title="Produtos" description="Carregando..." icon="cube-outline" />
        ) : products.length === 0 ? (
          <EmptyState
            title="Produtos"
            description="Nenhum produto cadastrado."
            icon="cube-outline"
            actionLabel="Adicionar produto"
            onActionPress={() => router.push('/products/new')}
          />
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
                subtitle={categoryNames.get(product.categoryId ?? '') ?? product.unit}
                trailing={<StatusBadge tone={product.quantity === 0 ? 'danger' : product.quantity <= product.minQuantity ? 'warning' : 'success'} label={String(product.quantity)} />}
              />
            </AppCard>
          ))
        )}
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Tipo de movimentação</AppCard.Title>
        <AppCard.Text>
          Escolha o tipo pelo efeito no saldo. Os blocos em destaque ajudam a evitar erros de registro.
        </AppCard.Text>
        <MovementTypePicker value={type} onChange={setType} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppInput
          helperText="Aceita até 3 casas decimais."
          label="Quantidade"
          placeholder="0"
          keyboardType="decimal-pad"
          mask="decimal"
          maskOptions={{ maxFractionDigits: 3 }}
          value={quantity}
          onChangeText={setQuantity}
        />
        <AppInput label="Motivo" placeholder="Compra, devolução, perda..." value={reason} onChangeText={setReason} />
        <AppInput label="Observação" placeholder="Digite uma observação" multiline value={notes} onChangeText={setNotes} />
      </AppCard>

      {selectedProduct ? (
        <AppCard style={styles.summaryCard}>
          <AppCard.Title>Resumo antes de salvar</AppCard.Title>
        <View style={styles.summaryRow}>
            <View style={styles.summaryBlock}>
              <AppCard.Text>Atual</AppCard.Text>
              <StatusBadge tone="info" label={String(selectedProduct.quantity)} />
            </View>
            <View style={styles.summaryBlock}>
              <AppCard.Text>Movimento</AppCard.Text>
              <StatusBadge tone={movementImpact >= 0 ? 'success' : 'warning'} label={`${movementImpact >= 0 ? '+' : ''}${quantityToMove}`} />
            </View>
            <View style={styles.summaryBlock}>
              <AppCard.Text>Novo saldo</AppCard.Text>
              <StatusBadge
                tone={resultingQuantity != null && resultingQuantity < selectedProduct.quantity ? 'warning' : 'success'}
                label={String(resultingQuantity ?? selectedProduct.quantity)}
              />
            </View>
          </View>
          <AppCard.Text>Tipo selecionado: {movementLabels[type]}</AppCard.Text>
          <AppCard.Text>
            {selectedProduct.name} vai {movementImpact >= 0 ? 'receber' : 'perder'} {quantityToMove} {selectedProduct.unit}.
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
        title="Confirmar movimentação?"
        message="Revise o tipo, a quantidade e o impacto no saldo antes de gravar. O anúncio obrigatório precisa terminar para concluir o salvamento."
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

const styles = StyleSheet.create({
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
