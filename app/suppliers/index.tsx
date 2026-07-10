import { useState } from 'react';
import { View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
  const [archiveId, setArchiveId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setEmail('');
    setActionError(undefined);
  };

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
      } else {
        await create(input);
      }

      resetForm();
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel salvar o fornecedor.');
    } finally {
      setBusy(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveId) {
      return;
    }

    setBusy(true);
    setActionError(undefined);
    try {
      await archive(archiveId);
      setArchiveId(null);
    } catch (nextError) {
      const message = nextError instanceof Error && nextError.message === 'SUPPLIER_HAS_PRODUCTS'
        ? 'Este fornecedor possui produtos vinculados. Remova o vinculo antes de arquivar.'
        : nextError instanceof Error ? nextError.message : 'Nao foi possivel arquivar o fornecedor.';
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Fornecedores" subtitle="Cadastre e mantenha contatos." actionLabel="Novo" onActionPress={resetForm} />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{editingId ? 'Editar fornecedor' : 'Novo fornecedor'}</AppCard.Title>
        <AppCard.Text>Toque em Novo para limpar o formulário ou em Editar para carregar os dados do item escolhido.</AppCard.Text>
        {editingId ? <StatusBadge tone="info" label="Editando" /> : null}
        <AppInput label="Nome" value={name} onChangeText={setName} />
        <AppInput label="Telefone" value={phone} onChangeText={setPhone} />
        <AppInput label="E-mail" value={email} onChangeText={setEmail} />
        <AppButton label={busy ? '...' : editingId ? 'Salvar' : 'Criar'} disabled={busy} onPress={() => void handleSave()} />
        {editingId ? <AppButton label="Cancelar edicao" variant="ghost" onPress={resetForm} /> : null}
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
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <AppButton
                label="Editar"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => {
                  setEditingId(supplier.id);
                  setName(supplier.name);
                  setPhone(supplier.phone ?? '');
                  setEmail(supplier.email ?? '');
                }}
              />
              <AppButton
                label="Excluir"
                variant="danger"
                style={{ flex: 1 }}
                disabled={busy}
                onPress={() => setArchiveId(supplier.id)}
              />
            </View>
          </AppCard>
        ))
      )}
      <ConfirmDialog
        visible={Boolean(archiveId)}
        title="Excluir fornecedor?"
        message="A exclusao arquiva o fornecedor sem apagar o historico. Fornecedores com produtos vinculados precisam ser liberados antes."
        confirmLabel="Excluir"
        danger
        onCancel={() => setArchiveId(null)}
        onConfirm={() => void handleArchive()}
      />
    </ScreenContainer>
  );
}
