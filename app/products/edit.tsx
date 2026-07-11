import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppModalSelect } from '@/components/ui/AppModalSelect';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { QuickCreateRelation } from '@/components/product/QuickCreateRelation';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { listCategories } from '@/database/repositories/categoryRepository';
import { archiveProduct, findProductById, updateProduct } from '@/database/repositories/productRepository';
import { listSuppliers } from '@/database/repositories/supplierRepository';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { translateAppError } from '@/i18n/errorMessages';
import { useAppState } from '@/state/app-state';
import type { Category } from '@/types/category';
import type { ProductUnit } from '@/types/product';
import type { Supplier } from '@/types/supplier';
import { formatDecimalInput, formatMoneyInputFromCents } from '@/utils/input-format';
import { formatMoney } from '@/utils/format';
import { parseMoneyToCents, parseNonNegativeNumber } from '@/utils/validators';

function getUnitOptions(t: (key: string) => string): Array<{ value: ProductUnit; label: string }> {
  return [
    { value: 'unit', label: t('productNew.unitEach') },
    { value: 'kg', label: 'Kg' },
    { value: 'g', label: 'g' },
    { value: 'l', label: 'L' },
    { value: 'ml', label: 'ml' },
    { value: 'box', label: t('productNew.unitBox') },
    { value: 'pack', label: t('productNew.unitPack') },
    { value: 'pair', label: t('productNew.unitPair') },
  ];
}

function getCurrencyPrefixDisplay(currency: string) {
  if (currency === 'USD') {
    return 'US$';
  }

  if (currency === 'EUR') {
    return '\u20AC';
  }

  return 'R$';
}

function getProductErrorMessage(error: unknown, fallback: string, t: (key: string) => string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  switch (error.message) {
    case 'PRODUCT_ID_MISSING':
      return t('productDetail.missing');
    case 'PRODUCT_NOT_FOUND':
      return t('productDetail.notFound');
    case 'PRODUCT_LOAD_FAILED':
      return t('productDetail.loadFailed');
    case 'PRODUCT_UPDATE_FAILED':
      return t('productDetail.saveFailed');
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

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const { t, language } = useI18n();
  const unitOptions = useMemo(() => getUnitOptions(t), [t]);
  const { currency } = useAppState();
  const { palette } = useAppTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [actionError, setActionError] = useState<string | undefined>();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [initialSignature, setInitialSignature] = useState('');
  const [quickCreateMode, setQuickCreateMode] = useState<'category' | 'supplier' | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
        setError(t('productDetail.missing'));
        return;
      }

      try {
        const [product, nextCategories, nextSuppliers] = await Promise.all([
          findProductById(productId),
          listCategories(),
          listSuppliers(),
        ]);
        if (!product) {
          setError(t('productDetail.notFound'));
          return;
        }

        const nextMinQuantity = formatDecimalInput(String(product.minQuantity));
        const nextCostPrice = formatMoneyInputFromCents(product.costPriceCents);
        const nextSalePrice = formatMoneyInputFromCents(product.salePriceCents);
        setCategories(nextCategories);
        setSuppliers(nextSuppliers);
        setName(product.name);
        setDescription(product.description ?? '');
        setSku(product.sku ?? '');
        setBarcode(product.barcode ?? '');
        setCategoryId(product.categoryId ?? '');
        setSupplierId(product.supplierId ?? '');
        setUnit(product.unit);
        setMinQuantity(nextMinQuantity);
        setCostPrice(nextCostPrice);
        setSalePrice(nextSalePrice);
        setExpirationDate(product.expirationDate ?? '');
        setBatchCode(product.batchCode ?? '');
        setLocation(product.location ?? '');
        setImageUri(product.imageUri ?? '');
        setNotes(product.notes ?? '');
        setInitialSignature(JSON.stringify({
          name: product.name,
          description: product.description ?? '',
          sku: product.sku ?? '',
          barcode: product.barcode ?? '',
          categoryId: product.categoryId ?? '',
          supplierId: product.supplierId ?? '',
          unit: product.unit,
          minQuantity: nextMinQuantity,
          costPrice: nextCostPrice,
          salePrice: nextSalePrice,
          expirationDate: product.expirationDate ?? '',
          batchCode: product.batchCode ?? '',
          location: product.location ?? '',
          imageUri: product.imageUri ?? '',
          notes: product.notes ?? '',
        }));
      } catch {
        setError(t('productDetail.loadFailed'));
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, t]);

  const canSave = useMemo(() => name.trim().length > 0 && !saving, [name, saving]);
  const currentSignature = useMemo(() => JSON.stringify({
    name,
    description,
    sku,
    barcode,
    categoryId,
    supplierId,
    unit,
    minQuantity,
    costPrice,
    salePrice,
    expirationDate,
    batchCode,
    location,
    imageUri,
    notes,
  }), [name, description, sku, barcode, categoryId, supplierId, unit, minQuantity, costPrice, salePrice, expirationDate, batchCode, location, imageUri, notes]);
  const dirty = Boolean(initialSignature && currentSignature !== initialSignature);

  const handleBack = () => {
    if (dirty) {
      setConfirmExit(true);
      return;
    }
    router.back();
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setActionError(t('productNew.imageDenied'));
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
      setActionError(t('productNew.imageFailed'));
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
        description: description.trim() || undefined,
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
      setActionError(getProductErrorMessage(nextError, t('productDetail.saveFailed'), t));
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
      setActionError(nextError instanceof Error ? nextError.message : t('productDetail.archiveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer padded>
        <LoadingState title={t('productDetail.edit')} description={t('common.loading')} />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer padded>
        <AppHeader title={t('productDetail.edit')} subtitle={t('productDetail.title')} variant="page" onBackPress={() => router.back()} />
        <ErrorState description={translateAppError(error, t)} actionLabel={t('common.back')} onActionPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll padded>
      <AppHeader
        title={t('productDetail.edit')}
        subtitle={t('productDetail.title')}
        variant="page"
        onBackPress={handleBack}
        rightAction={
          <Pressable onPress={() => void handleSave()} hitSlop={10} style={[styles.headerAction, { backgroundColor: palette.primary }]}>
            <Ionicons name="checkmark" size={20} color={palette.primaryText} />
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
          disabled={saving}
          openMode={quickCreateMode}
          onOpenModeChange={setQuickCreateMode}
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
        <AppCard.Title>{t('productNew.stockValues')}</AppCard.Title>
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
          prefix={getCurrencyPrefixDisplay(currency)}
          placeholder={t('productNew.moneyPlaceholder')}
          helperText={t('productNew.moneyExample', { example: formatMoney(1250, currency, language) })}
          keyboardType="decimal-pad"
          mask="money"
          value={costPrice}
          onChangeText={setCostPrice}
        />
        <AppInput
          inputSize="large"
          label={t('productNew.sale')}
          prefix={getCurrencyPrefixDisplay(currency)}
          placeholder={t('productNew.moneyPlaceholder')}
          helperText={t('productNew.moneyExample', { example: formatMoney(1990, currency, language) })}
          keyboardType="decimal-pad"
          mask="money"
          value={salePrice}
          onChangeText={setSalePrice}
        />
        <AppInput label={t('productNew.expiration')} helperText={t('productNew.expirationPlaceholder')} placeholder={t('productNew.expirationPlaceholder')} keyboardType="number-pad" mask="date" value={expirationDate} onChangeText={setExpirationDate} />
        <AppInput label={t('productNew.batch')} value={batchCode} onChangeText={setBatchCode} />
        <AppInput label={t('productNew.location')} placeholder={t('productNew.locationPlaceholder')} value={location} onChangeText={setLocation} />
        <AppInput label={t('productNew.notes')} placeholder={t('productNew.notesPlaceholder')} multiline value={notes} onChangeText={setNotes} />
      </AppCard>

      {actionError ? <ErrorState description={translateAppError(actionError, t)} /> : null}

      <AppButton label={t('common.save')} loading={saving} disabled={!canSave} onPress={() => void handleSave()} />
      <AppButton label={t('common.archive')} variant="secondary" disabled={saving} onPress={() => setConfirmArchive(true)} />

      <ConfirmDialog
        visible={confirmExit}
        title={t('productNew.discardTitle')}
        message={t('productNew.discardBody')}
        confirmLabel={t('common.continue')}
        danger
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => {
          setConfirmExit(false);
          router.back();
        }}
      />

      <ConfirmDialog
        visible={confirmArchive}
        title={t('productDetail.archiveTitle')}
        message={t('productDetail.archiveBody')}
        confirmLabel={t('common.archive')}
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
