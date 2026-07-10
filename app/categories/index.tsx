import { useState } from 'react';
import { View } from 'react-native';
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

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setColorToken('');
    setIconName('');
    setSortOrder('0');
    setActionError(undefined);
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
      } else {
        await create(input);
      }

      resetForm();
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
      <AppHeader title="Categorias" subtitle="Organize produtos por grupo." actionLabel="Nova" onActionPress={resetForm} />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{editingId ? 'Editar categoria' : 'Nova categoria'}</AppCard.Title>
        <AppCard.Text>Use este formulário para criar novas categorias ou editar a selecionada na lista abaixo.</AppCard.Text>
        {editingId ? <StatusBadge tone="info" label="Editando" /> : null}
        <AppInput label="Nome" placeholder="Ex.: Higiene" value={name} onChangeText={setName} />
        <AppInput label="Cor" placeholder="#B7F34D" helperText="Opcional. Pode usar hex ou nome do token." value={colorToken} onChangeText={setColorToken} />
        <AppInput label="Icone" placeholder="layers-outline" helperText="Use um nome válido do Ionicons." value={iconName} onChangeText={setIconName} />
        <AppInput label="Ordem" helperText="Menor número aparece primeiro." keyboardType="numeric" value={sortOrder} onChangeText={setSortOrder} />
        <AppButton label={busy ? '...' : editingId ? 'Salvar' : 'Criar'} disabled={busy} onPress={() => void handleSave()} />
        {editingId ? <AppButton label="Cancelar edicao" variant="ghost" onPress={resetForm} /> : null}
      </AppCard>

      {actionError ? <EmptyState title="Categorias" description={actionError} icon="layers-outline" /> : null}

      {loading ? (
        <EmptyState title="Categorias" description="Carregando..." icon="layers-outline" />
      ) : error ? (
        <EmptyState title="Categorias" description={error} icon="layers-outline" />
      ) : categories.length === 0 ? (
        <EmptyState title="Categorias" description="Nenhuma categoria cadastrada." icon="layers-outline" />
      ) : (
        categories.map((category) => (
          <AppCard key={category.id}>
            <AppCard.Row
              icon={resolveIcon(category.iconName)}
              title={category.name}
              subtitle={category.colorToken ?? 'Sem cor'}
              trailing={<StatusBadge tone={category.status === 'active' ? 'success' : 'info'} label={String(category.sortOrder)} />}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <AppButton
                label="Editar"
                variant="secondary"
                style={{ flex: 1 }}
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
                variant="danger"
                style={{ flex: 1 }}
                disabled={busy}
                onPress={() => setArchiveId(category.id)}
              />
            </View>
          </AppCard>
        ))
      )}
      <ConfirmDialog
        visible={Boolean(archiveId)}
        title="Arquivar categoria?"
        message="A exclusao arquiva a categoria sem apagar o historico. Categorias com produtos vinculados precisam ser liberadas antes."
        confirmLabel="Arquivar"
        danger
        onCancel={() => setArchiveId(null)}
        onConfirm={() => void handleArchive()}
      />
    </ScreenContainer>
  );
}
