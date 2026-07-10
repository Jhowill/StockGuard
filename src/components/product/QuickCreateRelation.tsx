import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppInput } from '@/components/ui/AppInput';
import { createCategory } from '@/database/repositories/categoryRepository';
import { createSupplier } from '@/database/repositories/supplierRepository';
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
      onError(friendlyRelationError(error, mode === 'category' ? 'Nao foi possivel criar a categoria.' : 'Nao foi possivel criar o fornecedor.'));
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.actionsRow}>
        <AppButton label="+ Categoria" variant="secondary" disabled={disabled || busy} style={styles.action} onPress={() => setMode('category')} />
        <AppButton label="+ Fornecedor" variant="secondary" disabled={disabled || busy} style={styles.action} onPress={() => setMode('supplier')} />
      </View>

      {mode ? (
        <AppCard variant="hero" style={styles.quickCard}>
          <AppCard.Title>{mode === 'category' ? 'Nova categoria rapida' : 'Novo fornecedor rapido'}</AppCard.Title>
          <AppCard.Text>
            {mode === 'category'
              ? 'Crie e selecione uma categoria sem sair deste produto.'
              : 'Crie e selecione um fornecedor sem perder os dados do produto.'}
          </AppCard.Text>
          <AppInput
            label={mode === 'category' ? 'Nome da categoria' : 'Nome do fornecedor'}
            placeholder={mode === 'category' ? 'Ex.: Bebidas' : 'Ex.: Distribuidora Alfa'}
            value={name}
            editable={!busy}
            onChangeText={setName}
          />
          {mode === 'supplier' ? (
            <>
              <AppInput label="Telefone" placeholder="(00) 00000-0000" value={phone} editable={!busy} onChangeText={setPhone} />
              <AppInput label="E-mail" placeholder="contato@exemplo.com" value={email} editable={!busy} keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />
            </>
          ) : null}
          <View style={styles.actionsRow}>
            <AppButton label={busy ? '...' : 'Criar e selecionar'} disabled={busy} style={styles.action} onPress={() => void save()} />
            <AppButton label="Cancelar" variant="ghost" disabled={busy} style={styles.action} onPress={reset} />
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
