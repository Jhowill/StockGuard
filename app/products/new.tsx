import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { listCategories } from '@/database/repositories/categoryRepository';
import { createProduct } from '@/database/repositories/productRepository';
import { listSuppliers } from '@/database/repositories/supplierRepository';
import { createStockMovement } from '@/services/stockMovementService';
import { useAppState } from '@/state/app-state';
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

export default function NewProductScreen() {
  const { t } = useI18n();
  const { currency } = useAppState();
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
      setError(err instanceof Error ? err.message : 'PRODUCT_CREATE_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('productNew.title')} subtitle={t('productNew.subtitle')} />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Identificacao</AppCard.Title>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
        <AppButton label={imageUri ? 'Trocar foto' : 'Adicionar foto'} variant="secondary" onPress={() => void pickImage()} />
        <AppInput label={t('productNew.name')} placeholder={t('productNew.namePlaceholder')} value={name} onChangeText={setName} />
        <AppInput label={t('productNew.sku')} placeholder="Ex: PAR316" value={sku} onChangeText={setSku} />
        <AppInput label={t('productNew.barcode')} placeholder="Ex: 789..." value={barcode} onChangeText={setBarcode} />
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
        <AppCard.Title>Estoque e valores</AppCard.Title>
        <View style={styles.row}>
          <AppInput label={t('productNew.quantity')} keyboardType="numeric" value={quantity} onChangeText={setQuantity} style={styles.flex} />
          <AppInput label={t('productNew.minQuantity')} keyboardType="numeric" value={minQuantity} onChangeText={setMinQuantity} style={styles.flex} />
        </View>
        <View style={styles.row}>
          <AppInput label="Custo" keyboardType="decimal-pad" value={costPrice} onChangeText={setCostPrice} style={styles.flex} />
          <AppInput label="Venda" keyboardType="decimal-pad" value={salePrice} onChangeText={setSalePrice} style={styles.flex} />
        </View>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Row icon="options-outline" title="Campos avancados" subtitle="Validade, lote, localizacao e observacoes." />
        <AppButton label={advancedOpen ? 'Ocultar avancados' : 'Mostrar avancados'} variant="ghost" onPress={() => setAdvancedOpen((current) => !current)} />
        {advancedOpen ? (
          <>
            <AppInput label="Validade" placeholder="AAAA-MM-DD" value={expirationDate} onChangeText={setExpirationDate} />
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
        message="Existem dados preenchidos neste produto. Se voltar agora, eles serao perdidos."
        confirmLabel="Descartar"
        danger
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => router.back()}
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
