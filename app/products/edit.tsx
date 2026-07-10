import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { QuickCreateRelation } from '@/components/product/QuickCreateRelation';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { listCategories } from '@/database/repositories/categoryRepository';
import { archiveProduct, findProductById, updateProduct } from '@/database/repositories/productRepository';
import { listSuppliers } from '@/database/repositories/supplierRepository';
import { useAppTheme } from '@/hooks/useAppTheme';
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

function getCurrencyPrefix(currency: string) {
  if (currency === 'USD') {
    return 'US$';
  }

  if (currency === 'EUR') {
    return '€';
  }

  return 'R$';
}

function getProductErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  switch (error.message) {
    case 'PRODUCT_ID_MISSING':
      return 'Produto nao informado.';
    case 'PRODUCT_NOT_FOUND':
      return 'Produto nao encontrado.';
    case 'PRODUCT_LOAD_FAILED':
      return 'Nao foi possivel carregar o produto.';
    case 'PRODUCT_UPDATE_FAILED':
      return 'Nao foi possivel salvar o produto.';
    case 'PRODUCT_BARCODE_ALREADY_EXISTS':
      return 'Ja existe um produto com este codigo de barras.';
    case 'PRODUCT_SKU_ALREADY_EXISTS':
      return 'Ja existe um produto com este SKU.';
    case 'CATEGORY_NOT_FOUND':
      return 'A categoria selecionada nao esta mais disponivel.';
    case 'SUPPLIER_NOT_FOUND':
      return 'O fornecedor selecionado nao esta mais disponivel.';
    default:
      return error.message;
  }
}

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const { currency } = useAppState();
  const { palette } = useAppTheme();
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
        setError('Produto nao informado.');
        return;
      }

      try {
        const [product, nextCategories, nextSuppliers] = await Promise.all([
          findProductById(productId),
          listCategories(),
          listSuppliers(),
        ]);
        if (!product) {
          setError('Produto nao encontrado.');
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
        setError('Nao foi possivel carregar o produto.');
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
      setActionError(getProductErrorMessage(nextError, 'Nao foi possivel salvar o produto.'));
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
        <AppHeader title="Editar produto" subtitle="Atualize os dados do item." variant="page" onBackPress={() => router.back()} />
        <ErrorState description={error} actionLabel="Voltar" onActionPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title="Editar produto"
        subtitle="Atualize os dados do item."
        variant="page"
        onBackPress={() => router.back()}
        rightAction={
          <Pressable onPress={() => void handleSave()} hitSlop={10} style={[styles.headerAction, { backgroundColor: '#B7F34D' }]}>
            <Ionicons name="checkmark" size={20} color="#0B0F14" />
          </Pressable>
        }
      />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Identificacao</AppCard.Title>
        <AppCard variant="hero" onPress={() => void pickImage()} style={styles.photoCard}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photoImage} />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: palette.background }]}>
              <Ionicons name="camera-outline" size={34} color={palette.primary} />
              <Text style={[styles.photoTitle, { color: palette.text }]}>Adicionar foto</Text>
              <Text style={[styles.photoSubtitle, { color: palette.textMuted }]}>Toque para escolher uma imagem da galeria.</Text>
            </View>
          )}
        </AppCard>
        <AppInput label="Nome" value={name} onChangeText={setName} />
        <AppInput label="SKU" value={sku} onChangeText={setSku} />
        <AppInput label="Codigo de barras" value={barcode} onChangeText={setBarcode} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Organizacao</AppCard.Title>
        <AppSelect label="Unidade" helperText="Escolha como este item será medido no estoque." value={unit} options={unitOptions} onChange={setUnit} />
        <AppSelect
          label="Categoria"
          helperText="Opcional. Ajuda a separar produtos por grupo."
          value={categoryId}
          options={[{ value: '', label: 'Sem categoria' }, ...categories.map((item) => ({ value: item.id, label: item.name }))]}
          onChange={setCategoryId}
        />
        <AppSelect
          label="Fornecedor"
          helperText="Opcional. Você pode vincular depois."
          value={supplierId}
          options={[{ value: '', label: 'Sem fornecedor' }, ...suppliers.map((item) => ({ value: item.id, label: item.name }))]}
          onChange={setSupplierId}
        />
        <QuickCreateRelation
          disabled={saving}
          onError={setActionError}
          onCategoryCreated={(category) => {
            setCategories((current) => [category, ...current]);
            setCategoryId(category.id);
          }}
          onSupplierCreated={(supplier) => {
            setSuppliers((current) => [supplier, ...current]);
            setSupplierId(supplier.id);
          }}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Estoque, valores e avancados</AppCard.Title>
        <AppInput label="Estoque minimo" helperText="Usado para alertas de reposição." keyboardType="decimal-pad" mask="decimal" maskOptions={{ maxFractionDigits: 3 }} value={minQuantity} onChangeText={setMinQuantity} />
        <AppInput
          label="Custo"
          prefix={getCurrencyPrefix(currency)}
          placeholder="0,00"
          helperText={`Ex.: ${getCurrencyPrefix(currency)} 12,50`}
          keyboardType="decimal-pad"
          mask="money"
          value={costPrice}
          onChangeText={setCostPrice}
        />
        <AppInput
          label="Venda"
          prefix={getCurrencyPrefix(currency)}
          placeholder="0,00"
          helperText={`Ex.: ${getCurrencyPrefix(currency)} 19,90`}
          keyboardType="decimal-pad"
          mask="money"
          value={salePrice}
          onChangeText={setSalePrice}
        />
        <AppInput label="Validade" helperText="Digite no formato AAAA-MM-DD." placeholder="AAAA-MM-DD" keyboardType="number-pad" mask="date" value={expirationDate} onChangeText={setExpirationDate} />
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
  photoCard: {
    gap: 0,
    padding: 0,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 188,
  },
  photoPlaceholder: {
    width: '100%',
    height: 188,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  photoTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  photoSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
});
