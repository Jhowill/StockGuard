import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useCategories } from '@/hooks/useCategories';
import { parseNonNegativeInteger } from '@/utils/validators';

export default function CategoriesScreen() {
  const { categories, loading, error, create, edit, archive } = useCategories();
  const [name, setName] = useState('');
  const [colorToken, setColorToken] = useState('');
  const [iconName, setIconName] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [archiveId, setArchiveId] = useState<string | null>(null);

  const resolveIcon = (iconName?: string) => {
    if (iconName && iconName in Ionicons.glyphMap) {
      return iconName as keyof typeof Ionicons.glyphMap;
    }

    return 'layers-outline' as keyof typeof Ionicons.glyphMap;
  };

  const handleSave = async () => {
    if (busy) {
      return;
    }

    const input = {
      name: name.trim(),
      colorToken: colorToken.trim() || undefined,
      iconName: iconName.trim() || undefined,
      sortOrder: parseNonNegativeInteger(sortOrder),
    };

    if (!input.name) {
      setActionError('Informe o nome da categoria.');
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
      setColorToken('');
      setIconName('');
      setSortOrder('0');
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel salvar a categoria.');
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
      const message = nextError instanceof Error && nextError.message === 'CATEGORY_HAS_PRODUCTS'
        ? 'Esta categoria possui produtos vinculados. Mova os produtos antes de arquivar.'
        : nextError instanceof Error ? nextError.message : 'Nao foi possivel arquivar a categoria.';
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Categorias" subtitle="Organize produtos por grupo." />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{editingId ? 'Editar categoria' : 'Nova categoria'}</AppCard.Title>
        <AppInput label="Nome" value={name} onChangeText={setName} />
        <AppInput label="Cor" value={colorToken} onChangeText={setColorToken} />
        <AppInput label="Icone" value={iconName} onChangeText={setIconName} />
        <AppInput label="Ordem" keyboardType="numeric" value={sortOrder} onChangeText={setSortOrder} />
        <AppButton label={busy ? '...' : editingId ? 'Salvar' : 'Criar'} disabled={busy} onPress={() => void handleSave()} />
        {editingId ? <AppButton label="Cancelar" variant="ghost" onPress={() => setEditingId(null)} /> : null}
      </AppCard>

      {actionError ? <EmptyState title="Categorias" description={actionError} /> : null}

      {loading ? (
        <EmptyState title="Categorias" description="Carregando..." />
      ) : error ? (
        <EmptyState title="Categorias" description={error} />
      ) : categories.length === 0 ? (
        <EmptyState title="Categorias" description="Nenhuma categoria cadastrada." />
      ) : (
        categories.map((category) => (
          <AppCard key={category.id}>
            <AppCard.Row
              icon={resolveIcon(category.iconName)}
              title={category.name}
              subtitle={category.colorToken ?? 'Sem cor'}
              trailing={<StatusBadge tone={category.status === 'active' ? 'success' : 'info'} label={String(category.sortOrder)} />}
            />
            <AppButton
              label="Editar"
              variant="secondary"
              onPress={() => {
                setEditingId(category.id);
                setName(category.name);
                setColorToken(category.colorToken ?? '');
                setIconName(category.iconName ?? '');
                setSortOrder(String(category.sortOrder));
              }}
            />
            <AppButton
              label="Arquivar"
              variant="ghost"
              disabled={busy}
              onPress={() => setArchiveId(category.id)}
            />
          </AppCard>
        ))
      )}
      <ConfirmDialog
        visible={Boolean(archiveId)}
        title="Arquivar categoria?"
        message="Categorias com produtos vinculados nao serao arquivadas ate que os produtos sejam movidos."
        confirmLabel="Arquivar"
        danger
        onCancel={() => setArchiveId(null)}
        onConfirm={() => void handleArchive()}
      />
    </ScreenContainer>
  );
}
