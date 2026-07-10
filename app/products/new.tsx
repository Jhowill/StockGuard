import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AdPolicyNotice } from '@/components/ads/AdPolicyNotice';
import { QuickCreateRelation } from '@/components/product/QuickCreateRelation';
import { ErrorState } from '@/components/ui/ErrorState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { listCategories } from '@/database/repositories/categoryRepository';
import { createProduct } from '@/database/repositories/productRepository';
import { listSuppliers } from '@/database/repositories/supplierRepository';
import { showRequiredStockSaveInterstitial } from '@/services/adsService';
import { createStockMovement } from '@/services/stockMovementService';
import { useAppState } from '@/state/app-state';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import type { ProductUnit } from '@/types/product';
import type { Category } from '@/types/category';
import type { Supplier } from '@/types/supplier';
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

function getProductCreateErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Nao foi possivel criar o produto.';
  }

  switch (error.message) {
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

export default function NewProductScreen() {
  const { t } = useI18n();
  const { currency } = useAppState();
  const { palette } = useAppTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [unit, setUnit] = useState<ProductUnit>('unit');
  const [quantity, setQuantity] = useState('0');
  const [minQuantity, setMinQuantity] = useState('0');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [location, setLocation] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [notes, setNotes] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    void Promise.all([listCategories(), listSuppliers()])
      .then(([nextCategories, nextSuppliers]) => {
        setCategories(nextCategories);
        setSuppliers(nextSuppliers);
      })
      .catch(() => setError('Nao foi possivel carregar categorias e fornecedores.'));
  }, []);

  const dirty = Boolean(name || sku || barcode || categoryId || supplierId || quantity !== '0' || minQuantity !== '0' || costPrice || salePrice || expirationDate || batchCode || location || imageUri || notes);
  const parsedQuantity = parseNonNegativeNumber(quantity);
  const parsedMinQuantity = parseNonNegativeNumber(minQuantity);
  const canSave = useMemo(() => name.trim().length > 0 && !loading, [loading, name]);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Permissao de imagens negada.');
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
      setError('Nao foi possivel selecionar a imagem.');
    }
  };

  const handleBack = () => {
    if (dirty) {
      setConfirmExit(true);
      return;
    }
    router.back();
  };

  const handleSave = async () => {
    if (loading || !name.trim()) {
      setError('Informe o nome do produto.');
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      const product = await createProduct({
        name: name.trim(),
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        categoryId: categoryId || undefined,
        supplierId: supplierId || undefined,
        quantity: 0,
        minQuantity: parsedMinQuantity,
        unit,
        costPriceCents: parseMoneyToCents(costPrice),
        salePriceCents: parseMoneyToCents(salePrice),
        currency,
        expirationDate: expirationDate.trim() || undefined,
        batchCode: batchCode.trim() || undefined,
        location: location.trim() || undefined,
        imageUri: imageUri || undefined,
        notes: notes.trim() || undefined,
      });

      if (parsedQuantity > 0) {
        const adResult = await showRequiredStockSaveInterstitial();
        if (adResult.status !== 'success') {
          throw new Error(adResult.status === 'cancelled' ? 'Assista ao anuncio ate o final para registrar o saldo inicial.' : adResult.reason);
        }

        await createStockMovement({
          productId: product.id,
          type: 'initial_balance',
          reason: 'initial_setup',
          quantity: parsedQuantity,
          currency,
        });
      }

      router.replace(`/products/${product.id}`);
    } catch (err) {
      setError(getProductCreateErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title={t('productNew.title')}
        subtitle={t('productNew.subtitle')}
        variant="page"
        onBackPress={handleBack}
        rightAction={
          <Pressable
            onPress={() => void handleSave()}
            hitSlop={10}
            style={[styles.headerAction, { backgroundColor: '#B7F34D' }]}
          >
            <Ionicons name="checkmark" size={20} color="#0B0F14" />
          </Pressable>
        }
      />

      <AdPolicyNotice
        title={t('ads.requiredTitle')}
        body={t('ads.requiredBody')}
        icon="alert-circle-outline"
        tone="required"
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
        <AppInput label={t('productNew.name')} placeholder={t('productNew.namePlaceholder')} value={name} onChangeText={setName} />
        <AppInput label={t('productNew.sku')} placeholder="Ex: PAR316" value={sku} onChangeText={setSku} />
        <AppInput label={t('productNew.barcode')} placeholder="Ex: 789..." value={barcode} onChangeText={setBarcode} />
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
          disabled={loading}
          onError={setError}
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
        <AppCard.Title>Estoque e valores</AppCard.Title>
        <View style={styles.row}>
          <AppInput
            label={t('productNew.quantity')}
            helperText="Aceita até 3 casas decimais."
            keyboardType="decimal-pad"
            mask="decimal"
            maskOptions={{ maxFractionDigits: 3 }}
            value={quantity}
            onChangeText={setQuantity}
            style={styles.flex}
          />
          <AppInput
            label={t('productNew.minQuantity')}
            helperText="Usado para alertas de reposição."
            keyboardType="decimal-pad"
            mask="decimal"
            maskOptions={{ maxFractionDigits: 3 }}
            value={minQuantity}
            onChangeText={setMinQuantity}
            style={styles.flex}
          />
        </View>
        <View style={styles.row}>
          <AppInput
            label="Custo"
            prefix={getCurrencyPrefix(currency)}
            placeholder="0,00"
            helperText={`Ex.: ${getCurrencyPrefix(currency)} 12,50`}
            keyboardType="decimal-pad"
            mask="money"
            value={costPrice}
            onChangeText={setCostPrice}
            style={styles.flex}
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
            style={styles.flex}
          />
        </View>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Row icon="options-outline" title="Campos avancados" subtitle="Validade, lote, localizacao e observacoes." />
        <AppButton label={advancedOpen ? 'Ocultar avancados' : 'Mostrar avancados'} variant="ghost" onPress={() => setAdvancedOpen((current) => !current)} />
        {advancedOpen ? (
          <>
            <AppInput label="Validade" placeholder="AAAA-MM-DD" keyboardType="number-pad" mask="date" value={expirationDate} onChangeText={setExpirationDate} />
            <AppInput label="Lote" value={batchCode} onChangeText={setBatchCode} />
            <AppInput label={t('productNew.location')} placeholder="Gaveta A1" value={location} onChangeText={setLocation} />
            <AppInput label={t('productNew.notes')} placeholder={t('productNew.notesPlaceholder')} multiline value={notes} onChangeText={setNotes} />
          </>
        ) : null}
      </AppCard>

      {error ? <ErrorState description={error} /> : null}

      <AppButton label={loading ? '...' : t('common.save')} disabled={!canSave} onPress={() => void handleSave()} />
      <AppButton label={t('common.back')} variant="ghost" onPress={handleBack} />

      <ConfirmDialog
        visible={confirmExit}
        title="Descartar alteracoes?"
        message="Existem dados preenchidos neste produto. Se voltar agora, eles serao perdidos. Caso haja saldo inicial, o anuncio obrigatorio tambem precisara ser concluido para registrar o estoque."
        confirmLabel="Descartar"
        danger
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => router.back()}
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
