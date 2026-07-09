import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { archiveProduct, findProductById, updateProduct } from '@/database/repositories/productRepository';
import { useAppState } from '@/state/app-state';

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currency } = useAppState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [minQuantity, setMinQuantity] = useState('0');
  const [costPriceCents, setCostPriceCents] = useState('');
  const [salePriceCents, setSalePriceCents] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    void (async () => {
      if (!id) {
        setLoading(false);
        setError('PRODUCT_ID_MISSING');
        return;
      }

      try {
        const product = await findProductById(id);
        if (!product) {
          setLoading(false);
          setError('PRODUCT_NOT_FOUND');
          return;
        }

        setName(product.name);
        setSku(product.sku ?? '');
        setBarcode(product.barcode ?? '');
        setCategoryId(product.categoryId ?? '');
        setSupplierId(product.supplierId ?? '');
        setMinQuantity(String(product.minQuantity));
        setCostPriceCents(product.costPriceCents ? String(product.costPriceCents) : '');
        setSalePriceCents(product.salePriceCents ? String(product.salePriceCents) : '');
        setLocation(product.location ?? '');
        setNotes(product.notes ?? '');
        setLoading(false);
      } catch {
        setLoading(false);
        setError('PRODUCT_LOAD_FAILED');
      }
    })();
  }, [id]);

  const canSave = useMemo(() => name.trim().length > 0 && !saving, [name, saving]);

  if (loading) {
    return (
      <ScreenContainer padded>
        <EmptyState title="Editar produto" description="Carregando..." />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer padded>
        <AppHeader title="Editar produto" subtitle="Atualize os dados do item." />
        <EmptyState title="Produtos" description={error} actionLabel="Voltar" onActionPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  const handleSave = async () => {
    if (!id || !canSave) {
      return;
    }

    setSaving(true);
    try {
      const next = await updateProduct({
        id,
        name: name.trim(),
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        categoryId: categoryId.trim() || undefined,
        supplierId: supplierId.trim() || undefined,
        minQuantity: Number(minQuantity || 0),
        currency,
        costPriceCents: costPriceCents ? Number(costPriceCents) : null,
        salePriceCents: salePriceCents ? Number(salePriceCents) : null,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!next) {
        throw new Error('PRODUCT_UPDATE_FAILED');
      }

      router.replace(`/products/${id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'PRODUCT_UPDATE_FAILED');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Editar produto" subtitle="Atualize os dados do item." />

      <AppCard style={{ gap: 12 }}>
        <AppInput label="Nome" value={name} onChangeText={setName} />
        <AppInput label="SKU" value={sku} onChangeText={setSku} />
        <AppInput label="Codigo de barras" value={barcode} onChangeText={setBarcode} />
        <AppInput label="Categoria" value={categoryId} onChangeText={setCategoryId} />
        <AppInput label="Fornecedor" value={supplierId} onChangeText={setSupplierId} />
        <AppInput label="Estoque minimo" keyboardType="numeric" value={minQuantity} onChangeText={setMinQuantity} />
        <AppInput label="Custo" keyboardType="numeric" value={costPriceCents} onChangeText={setCostPriceCents} />
        <AppInput label="Venda" keyboardType="numeric" value={salePriceCents} onChangeText={setSalePriceCents} />
        <AppInput label="Localizacao" value={location} onChangeText={setLocation} />
        <AppInput label="Observacoes" multiline value={notes} onChangeText={setNotes} />
      </AppCard>

      <AppButton label={saving ? '...' : 'Salvar'} onPress={() => void handleSave()} />
      <AppButton
        label="Arquivar"
        variant="secondary"
        onPress={async () => {
          if (!id) return;
          try {
            await archiveProduct(id);
          } finally {
            router.replace('/(tabs)/products');
          }
        }}
      />
      <AppButton label="Voltar" variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}
