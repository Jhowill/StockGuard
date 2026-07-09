import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { createStockMovement } from '@/services/stockMovementService';
import { useProducts } from '@/hooks/useProducts';
import { useAppState } from '@/state/app-state';
import type { StockMovementType } from '@/types/stock';

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
  const { currency } = useAppState();
  const { products, loading } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState(productId ?? '');
  const [type, setType] = useState<StockMovementType>('in');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const selectedProduct = useMemo(() => products.find((product) => product.id === selectedProductId), [products, selectedProductId]);

  const canSave = Boolean(selectedProduct && Number(quantity) > 0 && !saving);

  const handleSave = async () => {
    if (!selectedProduct || !canSave) {
      setError('Selecione um produto e informe uma quantidade valida.');
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      await createStockMovement({
        productId: selectedProduct.id,
        type,
        reason: reason.trim() || 'other',
        quantity: Number(quantity),
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
      <AppHeader title="Nova movimentacao" subtitle="Entrada, saida ou ajuste de estoque." />

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
              ? selectedProduct.quantity + Number(quantity || 0)
              : selectedProduct.quantity - Number(quantity || 0)}
          </AppCard.Text>
        </AppCard>
      ) : null}

      {error ? (
        <AppCard>
          <AppCard.Text>{error}</AppCard.Text>
        </AppCard>
      ) : null}

      <AppButton label={saving ? '...' : 'Salvar'} onPress={() => void handleSave()} />
      <AppButton label="Voltar" variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}
