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
import { parseNonNegativeInteger, parseNonNegativeNumber } from '@/utils/validators';

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const { currency } = useAppState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [actionError, setActionError] = useState<string | undefined>();
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
      if (!productId) {
        setLoading(false);
        setError('PRODUCT_ID_MISSING');
        return;
      }

      try {
        const product = await findProductById(productId);
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
  }, [productId]);

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
    if (!productId || !canSave) {
      return;
    }

    setSaving(true);
    setActionError(undefined);
    try {
      const next = await updateProduct({
        id: productId,
        name: name.trim(),
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        categoryId: categoryId.trim() || undefined,
        supplierId: supplierId.trim() || undefined,
        minQuantity: parseNonNegativeNumber(minQuantity),
        currency,
        costPriceCents: costPriceCents.trim() ? parseNonNegativeInteger(costPriceCents) : null,
        salePriceCents: salePriceCents.trim() ? parseNonNegativeInteger(salePriceCents) : null,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!next) {
        throw new Error('PRODUCT_UPDATE_FAILED');
      }

      router.replace(`/products/${productId}`);
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'PRODUCT_UPDATE_FAILED');
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

      {actionError ? <EmptyState title="Editar produto" description={actionError} /> : null}

      <AppButton label={saving ? '...' : 'Salvar'} disabled={!canSave} onPress={() => void handleSave()} />
      <AppButton
        label="Arquivar"
        variant="secondary"
        disabled={saving}
        onPress={async () => {
          if (!productId) return;
          setSaving(true);
          setActionError(undefined);
          try {
            await archiveProduct(productId);
            router.replace('/(tabs)/products');
          } catch (nextError) {
            setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel arquivar o produto.');
          } finally {
            setSaving(false);
          }
        }}
      />
      <AppButton label="Voltar" variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}
