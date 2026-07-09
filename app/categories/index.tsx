import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useCategories } from '@/hooks/useCategories';

export default function CategoriesScreen() {
  const { categories, loading, error, create, edit, archive } = useCategories();
  const [name, setName] = useState('');
  const [colorToken, setColorToken] = useState('');
  const [iconName, setIconName] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [editingId, setEditingId] = useState<string | null>(null);

  const resolveIcon = (iconName?: string) => {
    if (iconName && iconName in Ionicons.glyphMap) {
      return iconName as keyof typeof Ionicons.glyphMap;
    }

    return 'layers-outline' as keyof typeof Ionicons.glyphMap;
  };

  const handleSave = async () => {
    const input = {
      name: name.trim(),
      colorToken: colorToken.trim() || undefined,
      iconName: iconName.trim() || undefined,
      sortOrder: Number(sortOrder || 0),
    };

    if (!input.name) {
      return;
    }

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
        <AppButton label={editingId ? 'Salvar' : 'Criar'} onPress={() => void handleSave()} />
        {editingId ? <AppButton label="Cancelar" variant="ghost" onPress={() => setEditingId(null)} /> : null}
      </AppCard>

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
            <AppButton label="Arquivar" variant="ghost" onPress={() => void archive(category.id)} />
          </AppCard>
        ))
      )}
    </ScreenContainer>
  );
}
