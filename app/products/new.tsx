import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppModalSelect } from '@/components/ui/AppModalSelect';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { QuickCreateRelation, type QuickMode } from '@/components/product/QuickCreateRelation';
import { ErrorState } from '@/components/ui/ErrorState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { listCategories } from '@/database/repositories/categoryRepository';
import { listSuppliers } from '@/database/repositories/supplierRepository';
import { createProductWithInitialStock } from '@/services/stockMovementService';
import { deleteManagedProductImage, persistProductImage } from '@/services/productImageService';
import { useAppState } from '@/state/app-state';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { translateAppError } from '@/i18n/errorMessages';
import type { ProductUnit } from '@/types/product';
import type { Category } from '@/types/category';
import type { Supplier } from '@/types/supplier';
import { formatMoney } from '@/utils/format';
import { parseMoneyToCents, parseNonNegativeNumber } from '@/utils/validators';

function getUnitOptions(t: (key: string) => string): Array<{ value: ProductUnit; label: string }> {
  return [
    { value: 'unit', label: t('productNew.unitEach') },
    { value: 'kg', label: 'Kg' },
    { value: 'g', label: 'g' },
    { value: 'l', label: 'L' },
    { value: 'ml', label: 'ml' },
    { value: 'm', label: t('productNew.unitMeter') },
    { value: 'cm', label: t('productNew.unitCentimeter') },
    { value: 'box', label: t('productNew.unitBox') },
    { value: 'pack', label: t('productNew.unitPack') },
    { value: 'pair', label: t('productNew.unitPair') },
    { value: 'service_item', label: t('productNew.unitService') },
  ];
}

function getCurrencyPrefix(currency: string) {
  if (currency === 'USD') {
    return 'US$';
  }

  if (currency === 'EUR') {
    return '€';
  }

  return 'R$';
}

function getProductCreateErrorMessage(error: unknown, t: (key: string) => string) {
  if (!(error instanceof Error)) {
    return t('productNew.createFailed');
  }

  switch (error.message) {
    case 'PRODUCT_BARCODE_ALREADY_EXISTS':
      return t('productNew.barcodeExists');
    case 'PRODUCT_SKU_ALREADY_EXISTS':
      return t('productNew.skuExists');
    case 'CATEGORY_NOT_FOUND':
      return t('productNew.categoryMissing');
    case 'SUPPLIER_NOT_FOUND':
      return t('productNew.supplierMissing');
    default:
      return error.message;
  }
}

export default function NewProductScreen() {
  const { t, language } = useI18n();
  const unitOptions = useMemo(() => getUnitOptions(t), [t]);
  const { currency } = useAppState();
  const { palette } = useAppTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
  const stagedImageRef = useRef('');
  const imageCommittedRef = useRef(false);
  const [notes, setNotes] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [quickCreateMode, setQuickCreateMode] = useState<QuickMode>(null);

  useEffect(() => {
    void Promise.all([listCategories(), listSuppliers()])
      .then(([nextCategories, nextSuppliers]) => {
        setCategories(nextCategories);
        setSuppliers(nextSuppliers);
      })
      .catch(() => setError(t('productNew.loadRelationsFailed')));
  }, [t]);

  const dirty = Boolean(name || description || sku || barcode || categoryId || supplierId || quantity !== '0' || minQuantity !== '0' || costPrice || salePrice || expirationDate || batchCode || location || imageUri || notes);

  useEffect(() => () => {
    if (!imageCommittedRef.current) {
      void deleteManagedProductImage(stagedImageRef.current);
    }
  }, []);
  const parsedQuantity = parseNonNegativeNumber(quantity);
  const parsedMinQuantity = parseNonNegativeNumber(minQuantity);
  const canSave = useMemo(() => name.trim().length > 0 && !loading, [loading, name]);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError(t('productNew.imageDenied'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled) {
        const selectedUri = result.assets[0]?.uri;
        if (selectedUri) {
          const persistedUri = await persistProductImage(selectedUri);
          await deleteManagedProductImage(stagedImageRef.current);
          stagedImageRef.current = persistedUri;
          setImageUri(persistedUri);
        }
      }
    } catch {
      setError(t('productNew.imageFailed'));
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
      setError(t('productNew.nameRequired'));
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      const product = await createProductWithInitialStock({
        name: name.trim(),
        description: description.trim() || undefined,
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        categoryId: categoryId || undefined,
        supplierId: supplierId || undefined,
        initialQuantity: parsedQuantity,
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

      imageCommittedRef.current = true;
      router.replace({ pathname: '/products/[id]', params: { id: product.id } });
    } catch (err) {
      setError(getProductCreateErrorMessage(err, t));
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
            accessibilityRole="button"
            accessibilityLabel={t('common.save')}
            accessibilityState={{ disabled: !canSave, busy: loading }}
            disabled={!canSave}
            onPress={() => void handleSave()}
            hitSlop={10}
            style={({ pressed }) => [
              styles.headerAction,
              { backgroundColor: palette.primary },
              !canSave ? styles.headerActionDisabled : null,
              pressed ? styles.headerActionPressed : null,
            ]}
          >
            {loading ? <ActivityIndicator size="small" color={palette.primaryText} /> : <Ionicons name="checkmark" size={20} color={palette.primaryText} />}
          </Pressable>
        }
      />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('productNew.identification')}</AppCard.Title>
        <AppCard variant="hero" onPress={() => void pickImage()} style={styles.photoCard}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photoImage} />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: palette.background }]}>
              <Ionicons name="camera-outline" size={34} color={palette.primary} />
              <Text style={[styles.photoTitle, { color: palette.text }]}>{t('productNew.addPhoto')}</Text>
              <Text style={[styles.photoSubtitle, { color: palette.textMuted }]}>{t('productNew.addPhotoBody')}</Text>
            </View>
          )}
        </AppCard>
        <AppInput label={t('productNew.name')} placeholder={t('productNew.namePlaceholder')} value={name} onChangeText={setName} />
        <AppInput
          label={t('productNew.description')}
          placeholder={t('productNew.descriptionPlaceholder')}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <AppInput label={t('productNew.sku')} placeholder={t('productNew.skuPlaceholder')} value={sku} onChangeText={setSku} />
        <AppInput label={t('productNew.barcode')} placeholder={t('productNew.barcodePlaceholder')} value={barcode} onChangeText={setBarcode} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('productNew.organization')}</AppCard.Title>
        <AppModalSelect
          label={t('productNew.unit')}
          helperText={t('productNew.unitHelper')}
          placeholder={t('productNew.unit')}
          value={unit}
          options={unitOptions}
          onChange={setUnit}
        />
        <AppModalSelect
          label={t('productNew.category')}
          helperText={t('productNew.categoryHelper')}
          placeholder={t('common.noCategory')}
          value={categoryId}
          options={[{ value: '', label: t('common.noCategory') }, ...categories.map((item) => ({ value: item.id, label: item.name }))]}
          onChange={setCategoryId}
          onAdd={() => setQuickCreateMode('category')}
        />
        <AppModalSelect
          label={t('productNew.supplier')}
          helperText={t('productNew.supplierHelper')}
          placeholder={t('common.noSupplier')}
          value={supplierId}
          options={[{ value: '', label: t('common.noSupplier') }, ...suppliers.map((item) => ({ value: item.id, label: item.name }))]}
          onChange={setSupplierId}
          onAdd={() => setQuickCreateMode('supplier')}
        />
        <QuickCreateRelation
          disabled={loading}
          openMode={quickCreateMode}
          onOpenModeChange={setQuickCreateMode}
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
        <AppCard.Title>{t('productNew.stockValues')}</AppCard.Title>
        <AppInput
          inputSize="large"
          label={t('productNew.quantity')}
          helperText={t('productNew.decimalHelper')}
          keyboardType="decimal-pad"
          mask="decimal"
          maskOptions={{ maxFractionDigits: 3 }}
          value={quantity}
          onChangeText={setQuantity}
        />
        <AppInput
          inputSize="large"
          label={t('productNew.minQuantity')}
          helperText={t('productNew.minHelper')}
          keyboardType="decimal-pad"
          mask="decimal"
          maskOptions={{ maxFractionDigits: 3 }}
          value={minQuantity}
          onChangeText={setMinQuantity}
        />
        <AppInput
          inputSize="large"
          label={t('productNew.cost')}
          helperText={`${t('productNew.perUnit')} - ${t('productNew.moneyExample', { example: formatMoney(1250, currency, language) })}`}
          prefix={getCurrencyPrefix(currency)}
          placeholder={t('productNew.moneyPlaceholder')}
          keyboardType="decimal-pad"
          mask="money"
          value={costPrice}
          onChangeText={setCostPrice}
        />
        <AppInput
          inputSize="large"
          label={t('productNew.sale')}
          helperText={`${t('productNew.perUnit')} - ${t('productNew.moneyExample', { example: formatMoney(1990, currency, language) })}`}
          prefix={getCurrencyPrefix(currency)}
          placeholder={t('productNew.moneyPlaceholder')}
          keyboardType="decimal-pad"
          mask="money"
          value={salePrice}
          onChangeText={setSalePrice}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Row icon="options-outline" title={t('productNew.advanced')} subtitle={t('productNew.advancedBody')} />
        <AppButton label={advancedOpen ? t('productNew.hideAdvanced') : t('productNew.showAdvanced')} variant="ghost" onPress={() => setAdvancedOpen((current) => !current)} />
        {advancedOpen ? (
          <>
            <AppInput label={t('productNew.expiration')} placeholder={t('productNew.expirationPlaceholder')} keyboardType="number-pad" mask="date" value={expirationDate} onChangeText={setExpirationDate} />
            <AppInput label={t('productNew.batch')} value={batchCode} onChangeText={setBatchCode} />
            <AppInput label={t('productNew.location')} placeholder={t('productNew.locationPlaceholder')} value={location} onChangeText={setLocation} />
            <AppInput label={t('productNew.notes')} placeholder={t('productNew.notesPlaceholder')} multiline value={notes} onChangeText={setNotes} />
          </>
        ) : null}
      </AppCard>

      {error ? <ErrorState description={translateAppError(error, t)} /> : null}

      <AppButton label={t('common.save')} loading={loading} disabled={!canSave} onPress={() => void handleSave()} />

      <ConfirmDialog
        visible={confirmExit}
        title={t('productNew.discardTitle')}
        message={t('productNew.discardBody')}
        confirmLabel={t('productNew.discard')}
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
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionDisabled: {
    opacity: 0.45,
  },
  headerActionPressed: {
    opacity: 0.8,
  },
});
