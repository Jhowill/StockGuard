import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { createProduct } from '@/database/repositories/productRepository';
import { createStockMovement } from '@/services/stockMovementService';
import { useAppState } from '@/state/app-state';
import { useI18n } from '@/hooks/useI18n';
import { parseNonNegativeInteger, parseNonNegativeNumber } from '@/utils/validators';

export default function NewProductScreen() {
  const { t } = useI18n();
  const { currency } = useAppState();
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [minQuantity, setMinQuantity] = useState('0');
  const [costPriceCents, setCostPriceCents] = useState('');
  const [salePriceCents, setSalePriceCents] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const parsedQuantity = parseNonNegativeNumber(quantity);
  const parsedMinQuantity = parseNonNegativeNumber(minQuantity);
  const parsedCostPriceCents = costPriceCents.trim() ? parseNonNegativeInteger(costPriceCents) : null;
  const parsedSalePriceCents = salePriceCents.trim() ? parseNonNegativeInteger(salePriceCents) : null;

  const canSave = useMemo(() => name.trim().length > 0 && !loading, [loading, name]);

  const handleSave = async () => {
    if (loading) {
      return;
    }

    if (!name.trim()) {
      setError('NAME_REQUIRED');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const product = await createProduct({
        name: name.trim(),
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        categoryId: categoryId.trim() || undefined,
        quantity: 0,
        minQuantity: parsedMinQuantity,
        unit: 'unit',
        costPriceCents: parsedCostPriceCents,
        salePriceCents: parsedSalePriceCents,
        currency,
        location: location.trim() || undefined,
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
        <AppInput label={t('productNew.name')} placeholder={t('productNew.namePlaceholder')} value={name} onChangeText={setName} />
        <AppInput label={t('productNew.sku')} placeholder="Ex: PAR316" value={sku} onChangeText={setSku} />
        <AppInput label={t('productNew.barcode')} placeholder="Ex: 789..." value={barcode} onChangeText={setBarcode} />
        <AppInput label={t('productNew.category')} placeholder={t('productNew.categoryPlaceholder')} value={categoryId} onChangeText={setCategoryId} />
        <AppInput label={t('productNew.quantity')} placeholder="0" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
        <AppInput label={t('productNew.minQuantity')} placeholder="0" keyboardType="numeric" value={minQuantity} onChangeText={setMinQuantity} />
        <AppInput label={t('productNew.cost')} placeholder="0" keyboardType="numeric" value={costPriceCents} onChangeText={setCostPriceCents} />
        <AppInput label={t('productNew.sale')} placeholder="0" keyboardType="numeric" value={salePriceCents} onChangeText={setSalePriceCents} />
        <AppInput label={t('productNew.location')} placeholder="Gaveta A1" value={location} onChangeText={setLocation} />
        <AppInput label={t('productNew.notes')} placeholder={t('productNew.notesPlaceholder')} multiline value={notes} onChangeText={setNotes} />
      </AppCard>

      {error ? <AppCard><AppCard.Text>{error}</AppCard.Text></AppCard> : null}

      <AppButton label={loading ? '...' : t('common.save')} disabled={!canSave} onPress={() => void handleSave()} />
      <AppButton label={t('common.back')} variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}
