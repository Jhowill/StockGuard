import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSuppliers } from '@/hooks/useSuppliers';

export default function SuppliersScreen() {
  const { suppliers, loading, error, create, edit, archive } = useSuppliers();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    if (busy) {
      return;
    }

    const input = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
    };

    if (!input.name) {
      setActionError('Informe o nome do fornecedor.');
      return;
    }

    setBusy(true);
    setActionError(undefined);
    try {
      if (editingId) {
        await edit(editingId, input);
        setEditingId(null);
      } else {
        await create(input);
      }

      setName('');
      setPhone('');
      setEmail('');
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel salvar o fornecedor.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Fornecedores" subtitle="Cadastre e mantenha contatos." />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{editingId ? 'Editar fornecedor' : 'Novo fornecedor'}</AppCard.Title>
        <AppInput label="Nome" value={name} onChangeText={setName} />
        <AppInput label="Telefone" value={phone} onChangeText={setPhone} />
        <AppInput label="E-mail" value={email} onChangeText={setEmail} />
        <AppButton label={busy ? '...' : editingId ? 'Salvar' : 'Criar'} disabled={busy} onPress={() => void handleSave()} />
        {editingId ? <AppButton label="Cancelar" variant="ghost" onPress={() => setEditingId(null)} /> : null}
      </AppCard>

      {actionError ? <EmptyState title="Fornecedores" description={actionError} /> : null}

      {loading ? (
        <EmptyState title="Fornecedores" description="Carregando..." />
      ) : error ? (
        <EmptyState title="Fornecedores" description={error} />
      ) : suppliers.length === 0 ? (
        <EmptyState title="Fornecedores" description="Nenhum fornecedor cadastrado." />
      ) : (
        suppliers.map((supplier) => (
          <AppCard key={supplier.id}>
            <AppCard.Row
              icon="business-outline"
              title={supplier.name}
              subtitle={supplier.phone ?? supplier.email ?? 'Sem contato'}
              trailing={<StatusBadge tone={supplier.status === 'active' ? 'success' : 'info'} label={supplier.status} />}
            />
            <AppButton
              label="Editar"
              variant="secondary"
              onPress={() => {
                setEditingId(supplier.id);
                setName(supplier.name);
                setPhone(supplier.phone ?? '');
                setEmail(supplier.email ?? '');
              }}
            />
            <AppButton
              label="Arquivar"
              variant="ghost"
              disabled={busy}
              onPress={async () => {
                setBusy(true);
                setActionError(undefined);
                try {
                  await archive(supplier.id);
                } catch (nextError) {
                  setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel arquivar o fornecedor.');
                } finally {
                  setBusy(false);
                }
              }}
            />
          </AppCard>
        ))
      )}
    </ScreenContainer>
  );
}
