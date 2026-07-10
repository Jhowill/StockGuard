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
import { useI18n } from '@/hooks/useI18n';
import { useSuppliers } from '@/hooks/useSuppliers';

export default function SuppliersScreen() {
  const { t } = useI18n();
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
      setActionError(t('suppliers.nameRequired'));
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
      setActionError(nextError instanceof Error ? nextError.message : t('suppliers.saveFailed'));
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
        ? t('suppliers.linkedError')
        : nextError instanceof Error ? nextError.message : t('suppliers.archiveFailed');
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('suppliers.title')} subtitle={t('suppliers.subtitle')} actionLabel={t('suppliers.newAction')} onActionPress={resetForm} />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{editingId ? t('suppliers.edit') : t('suppliers.new')}</AppCard.Title>
        <AppCard.Text>{t('suppliers.formBody')}</AppCard.Text>
        {editingId ? <StatusBadge tone="info" label={t('suppliers.editBadge')} /> : null}
        <AppInput label={t('suppliers.name')} placeholder="Ex.: Distribuidora Alfa" value={name} onChangeText={setName} />
        <AppInput label={t('suppliers.phone')} placeholder="(00) 00000-0000" helperText={t('suppliers.phoneHelper')} value={phone} onChangeText={setPhone} />
        <AppInput label={t('suppliers.email')} placeholder="contato@exemplo.com" helperText={t('suppliers.emailHelper')} value={email} onChangeText={setEmail} />
        <AppButton label={busy ? '...' : editingId ? t('common.save') : t('common.create')} disabled={busy} onPress={() => void handleSave()} />
        {editingId ? <AppButton label={t('common.cancel')} variant="ghost" onPress={resetForm} /> : null}
      </AppCard>

      {actionError ? <EmptyState title={t('suppliers.title')} description={actionError} icon="business-outline" /> : null}

      {loading ? (
        <EmptyState title={t('suppliers.title')} description={t('common.loading')} icon="business-outline" />
      ) : error ? (
        <EmptyState title={t('suppliers.title')} description={error} icon="business-outline" />
      ) : suppliers.length === 0 ? (
        <EmptyState title={t('suppliers.title')} description={t('suppliers.empty')} icon="business-outline" />
      ) : (
        suppliers.map((supplier) => (
          <AppCard key={supplier.id}>
            <AppCard.Row
              icon="business-outline"
              title={supplier.name}
              subtitle={supplier.phone ?? supplier.email ?? t('suppliers.noContact')}
              trailing={<StatusBadge tone={supplier.status === 'active' ? 'success' : 'info'} label={supplier.status === 'active' ? t('common.active') : t('common.archived')} />}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <AppButton
                label={t('common.edit')}
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
                label={t('common.archive')}
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
        title={t('suppliers.archiveTitle')}
        message={t('suppliers.archiveBody')}
        confirmLabel={t('common.archive')}
        danger
        onCancel={() => setArchiveId(null)}
        onConfirm={() => void handleArchive()}
      />
    </ScreenContainer>
  );
}
