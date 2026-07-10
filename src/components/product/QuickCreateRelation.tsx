import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppInput } from '@/components/ui/AppInput';
import { createCategory } from '@/database/repositories/categoryRepository';
import { createSupplier } from '@/database/repositories/supplierRepository';
import { useI18n } from '@/hooks/useI18n';
import type { Category } from '@/types/category';
import type { Supplier } from '@/types/supplier';

type Props = {
  disabled?: boolean;
  onCategoryCreated: (category: Category) => void;
  onSupplierCreated: (supplier: Supplier) => void;
  onError: (message: string) => void;
};

type QuickMode = 'category' | 'supplier' | null;

function friendlyRelationError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  switch (error.message) {
    case 'CATEGORY_ALREADY_EXISTS':
      return 'Ja existe uma categoria com esse nome.';
    case 'CATEGORY_NAME_REQUIRED':
      return 'Informe o nome da categoria.';
    case 'SUPPLIER_NAME_REQUIRED':
      return 'Informe o nome do fornecedor.';
    case 'INVALID_SUPPLIER_EMAIL':
      return 'Informe um e-mail valido para o fornecedor.';
    default:
      return error.message;
  }
}

export function QuickCreateRelation({ disabled, onCategoryCreated, onSupplierCreated, onError }: Props) {
  const { t } = useI18n();
  const [mode, setMode] = useState<QuickMode>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setMode(null);
    setName('');
    setPhone('');
    setEmail('');
    setBusy(false);
  };

  const save = async () => {
    if (busy || !mode) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      onError(mode === 'category' ? 'Informe o nome da categoria.' : 'Informe o nome do fornecedor.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'category') {
        const category = await createCategory({
          name: trimmedName,
          sortOrder: 0,
        });
        onCategoryCreated(category);
      } else {
        const supplier = await createSupplier({
          name: trimmedName,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
        });
        onSupplierCreated(supplier);
      }
      reset();
    } catch (error) {
      onError(friendlyRelationError(error, mode === 'category' ? t('categories.saveFailed') : t('suppliers.saveFailed')));
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.actionsRow}>
        <AppButton label={t('quickCreate.category')} variant="secondary" disabled={disabled || busy} style={styles.action} onPress={() => setMode('category')} />
        <AppButton label={t('quickCreate.supplier')} variant="secondary" disabled={disabled || busy} style={styles.action} onPress={() => setMode('supplier')} />
      </View>

      {mode ? (
        <AppCard variant="hero" style={styles.quickCard}>
          <AppCard.Title>{mode === 'category' ? t('quickCreate.categoryTitle') : t('quickCreate.supplierTitle')}</AppCard.Title>
          <AppCard.Text>
            {mode === 'category'
              ? t('quickCreate.categoryBody')
              : t('quickCreate.supplierBody')}
          </AppCard.Text>
          <AppInput
            label={mode === 'category' ? t('quickCreate.categoryName') : t('quickCreate.supplierName')}
            placeholder={mode === 'category' ? 'Ex.: Bebidas' : 'Ex.: Distribuidora Alfa'}
            value={name}
            editable={!busy}
            onChangeText={setName}
          />
          {mode === 'supplier' ? (
            <>
              <AppInput label={t('suppliers.phone')} placeholder="(00) 00000-0000" value={phone} editable={!busy} onChangeText={setPhone} />
              <AppInput label={t('suppliers.email')} placeholder="contato@exemplo.com" value={email} editable={!busy} keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />
            </>
          ) : null}
          <View style={styles.actionsRow}>
            <AppButton label={busy ? '...' : t('quickCreate.createSelect')} disabled={busy} style={styles.action} onPress={() => void save()} />
            <AppButton label={t('common.cancel')} variant="ghost" disabled={busy} style={styles.action} onPress={reset} />
          </View>
        </AppCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
  },
  quickCard: {
    gap: 12,
  },
});
