import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { listCategories } from '@/database/repositories/categoryRepository';
import { archiveProduct, findProductById, updateProduct } from '@/database/repositories/productRepository';
import { listSuppliers } from '@/database/repositories/supplierRepository';
import { useAppState } from '@/state/app-state';
import type { Category } from '@/types/category';
import type { ProductUnit } from '@/types/product';
import type { Supplier } from '@/types/supplier';
import { formatDecimalInput, formatMoneyInputFromCents } from '@/utils/input-format';
import { parseMoneyToCents, parseNonNegativeNumber } from '@/utils/validators';

const unitOptions: Array<{ value: ProductUnit; label: string }> = [
  { value: 'unit', label: 'Unidade' },
  { value: 'kg', label: 'Kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'L' },
  { value: 'ml', label: 'ml' },
  { value: 'box', label: 'Caixa' },
  { value: 'pack', label: 'Pacote' },
  { value: 'pair', label: 'Par' },
];

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const { currency } = useAppState();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [actionError, setActionError] = useState<string | undefined>();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [unit, setUnit] = useState<ProductUnit>('unit');
  const [minQuantity, setMinQuantity] = useState('0');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [location, setLocation] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    void (async () => {
      if (!productId) {
        setLoading(false);
        setError('PRODUCT_ID_MISSING');
        return;
      }

      try {
        const [product, nextCategories, nextSuppliers] = await Promise.all([
          findProductById(productId),
          listCategories(),
          listSuppliers(),
        ]);
        if (!product) {
          setError('PRODUCT_NOT_FOUND');
          return;
        }

        setCategories(nextCategories);
        setSuppliers(nextSuppliers);
        setName(product.name);
        setSku(product.sku ?? '');
        setBarcode(product.barcode ?? '');
        setCategoryId(product.categoryId ?? '');
        setSupplierId(product.supplierId ?? '');
        setUnit(product.unit);
        setMinQuantity(formatDecimalInput(String(product.minQuantity)));
        setCostPrice(formatMoneyInputFromCents(product.costPriceCents));
        setSalePrice(formatMoneyInputFromCents(product.salePriceCents));
        setExpirationDate(product.expirationDate ?? '');
        setBatchCode(product.batchCode ?? '');
        setLocation(product.location ?? '');
        setImageUri(product.imageUri ?? '');
        setNotes(product.notes ?? '');
      } catch {
        setError('PRODUCT_LOAD_FAILED');
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const canSave = useMemo(() => name.trim().length > 0 && !saving, [name, saving]);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setActionError('Permissao de imagens negada.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0]?.uri ?? '');
      }
    } catch {
      setActionError('Nao foi possivel selecionar a imagem.');
    }
  };

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
        categoryId: categoryId || undefined,
        supplierId: supplierId || undefined,
        unit,
        minQuantity: parseNonNegativeNumber(minQuantity),
        currency,
        costPriceCents: parseMoneyToCents(costPrice),
        salePriceCents: parseMoneyToCents(salePrice),
        expirationDate: expirationDate.trim() || undefined,
        batchCode: batchCode.trim() || undefined,
        location: location.trim() || undefined,
        imageUri: imageUri || undefined,
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

  const handleArchive = async () => {
    if (!productId || saving) {
      return;
    }

    setConfirmArchive(false);
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
  };

  if (loading) {
    return (
      <ScreenContainer padded>
        <LoadingState title="Editar produto" description="Carregando dados do produto." />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer padded>
        <AppHeader title="Editar produto" subtitle="Atualize os dados do item." />
        <ErrorState description={error} actionLabel="Voltar" onActionPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Editar produto" subtitle="Atualize os dados do item." />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Identificacao</AppCard.Title>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
        <AppButton label={imageUri ? 'Trocar foto' : 'Adicionar foto'} variant="secondary" onPress={() => void pickImage()} />
        <AppInput label="Nome" value={name} onChangeText={setName} />
        <AppInput label="SKU" value={sku} onChangeText={setSku} />
        <AppInput label="Codigo de barras" value={barcode} onChangeText={setBarcode} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Organizacao</AppCard.Title>
        <AppSelect label="Unidade" value={unit} options={unitOptions} onChange={setUnit} />
        <AppSelect
          label="Categoria"
          value={categoryId}
          options={[{ value: '', label: 'Sem categoria' }, ...categories.map((item) => ({ value: item.id, label: item.name }))]}
          onChange={setCategoryId}
        />
        <AppSelect
          label="Fornecedor"
          value={supplierId}
          options={[{ value: '', label: 'Sem fornecedor' }, ...suppliers.map((item) => ({ value: item.id, label: item.name }))]}
          onChange={setSupplierId}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Estoque, valores e avancados</AppCard.Title>
        <AppInput label="Estoque minimo" keyboardType="decimal-pad" mask="decimal" maskOptions={{ maxFractionDigits: 3 }} value={minQuantity} onChangeText={setMinQuantity} />
        <AppInput label="Custo" keyboardType="decimal-pad" mask="money" value={costPrice} onChangeText={setCostPrice} />
        <AppInput label="Venda" keyboardType="decimal-pad" mask="money" value={salePrice} onChangeText={setSalePrice} />
        <AppInput label="Validade" placeholder="AAAA-MM-DD" keyboardType="number-pad" mask="date" value={expirationDate} onChangeText={setExpirationDate} />
        <AppInput label="Lote" value={batchCode} onChangeText={setBatchCode} />
        <AppInput label="Localizacao" value={location} onChangeText={setLocation} />
        <AppInput label="Observacoes" multiline value={notes} onChangeText={setNotes} />
      </AppCard>

      {actionError ? <ErrorState description={actionError} /> : null}

      <AppButton label={saving ? '...' : 'Salvar'} disabled={!canSave} onPress={() => void handleSave()} />
      <AppButton label="Arquivar" variant="secondary" disabled={saving} onPress={() => setConfirmArchive(true)} />
      <AppButton label="Voltar" variant="ghost" onPress={() => router.back()} />

      <ConfirmDialog
        visible={confirmArchive}
        title="Arquivar produto?"
        message="O produto sairá das listas principais, mas o historico permanece salvo."
        confirmLabel="Arquivar"
        danger
        onCancel={() => setConfirmArchive(false)}
        onConfirm={() => void handleArchive()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 180,
    borderRadius: 18,
  },
});
