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
import { useI18n } from '@/hooks/useI18n';
import { translateAppError } from '@/i18n/errorMessages';
import { parseNonNegativeInteger } from '@/utils/validators';

export default function CategoriesScreen() {
  const { t } = useI18n();
  const { categories, loading, error, create, edit, archive } = useCategories();
  const [name, setName] = useState('');
  const [colorToken, setColorToken] = useState('');
  const [iconName, setIconName] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [archiveId, setArchiveId] = useState<string | null>(null);

  const resolveIcon = (nextIconName?: string) => {
    if (nextIconName && nextIconName in Ionicons.glyphMap) {
      return nextIconName as keyof typeof Ionicons.glyphMap;
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
      setActionError(t('categories.nameRequired'));
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
      setActionError(nextError instanceof Error ? nextError.message : t('categories.saveFailed'));
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
        ? t('categories.linkedError')
        : nextError instanceof Error ? nextError.message : t('categories.archiveFailed');
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('categories.title')} subtitle={t('categories.subtitle')} actionLabel={t('categories.newAction')} onActionPress={resetForm} />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{editingId ? t('categories.edit') : t('categories.new')}</AppCard.Title>
        <AppCard.Text>{t('categories.formBody')}</AppCard.Text>
        {editingId ? <StatusBadge tone="info" label={t('categories.editBadge')} /> : null}
        <AppInput label={t('categories.name')} placeholder={t('categories.namePlaceholder')} value={name} onChangeText={setName} />
        <AppInput label={t('categories.color')} placeholder={t('categories.colorPlaceholder')} helperText={t('categories.colorHelper')} value={colorToken} onChangeText={setColorToken} />
        <AppInput label={t('categories.icon')} placeholder={t('categories.iconPlaceholder')} helperText={t('categories.iconHelper')} value={iconName} onChangeText={setIconName} />
        <AppInput label={t('categories.order')} placeholder={t('categories.orderPlaceholder')} helperText={t('categories.orderHelper')} keyboardType="numeric" value={sortOrder} onChangeText={setSortOrder} />
        <AppButton label={busy ? '...' : editingId ? t('common.save') : t('common.create')} disabled={busy} onPress={() => void handleSave()} />
        {editingId ? <AppButton label={t('common.cancel')} variant="ghost" onPress={resetForm} /> : null}
      </AppCard>

      {actionError ? <EmptyState title={t('categories.title')} description={translateAppError(actionError, t)} icon="layers-outline" /> : null}

      {loading ? (
        <EmptyState title={t('categories.title')} description={t('common.loading')} icon="layers-outline" />
      ) : error ? (
        <EmptyState title={t('categories.title')} description={translateAppError(error, t)} icon="layers-outline" />
      ) : categories.length === 0 ? (
        <EmptyState title={t('categories.title')} description={t('categories.empty')} icon="layers-outline" />
      ) : (
        categories.map((category) => (
          <AppCard key={category.id}>
            <AppCard.Row
              icon={resolveIcon(category.iconName)}
              title={category.name}
              subtitle={category.colorToken ?? t('categories.noColor')}
              trailing={<StatusBadge tone={category.status === 'active' ? 'success' : 'info'} label={String(category.sortOrder)} />}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <AppButton
                label={t('common.edit')}
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
                label={t('common.archive')}
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
        title={t('categories.archiveTitle')}
        message={t('categories.archiveBody')}
        confirmLabel={t('common.archive')}
        danger
        onCancel={() => setArchiveId(null)}
        onConfirm={() => void handleArchive()}
      />
    </ScreenContainer>
  );
}
