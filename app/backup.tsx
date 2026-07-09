import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useBackup } from '@/hooks/useBackup';
import { formatShortDateTime } from '@/utils/date-format';

export default function BackupScreen() {
  const { backups, loading, error, createBackup, restoreBackup, shareBackup } = useBackup();
  const [fileUri, setFileUri] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Backup" subtitle="Exportacao e restauracao local." />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Criar backup</AppCard.Title>
        <AppCard.Text>Gere um arquivo local com produtos, categorias, fornecedores e configuracoes.</AppCard.Text>
        <AppButton
          label={busy ? '...' : 'Gerar backup'}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            setActionError(undefined);
            try {
              const result = await createBackup();
              setFileUri(result.fileUri);
            } catch (nextError) {
              setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel gerar o backup.');
            } finally {
              setBusy(false);
            }
          }}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Restaurar backup</AppCard.Title>
        <AppCard.Text>Informe o arquivo local para restaurar seus dados.</AppCard.Text>
        <AppInput label="Caminho do arquivo" value={fileUri} onChangeText={setFileUri} />
        <AppButton
          label="Restaurar"
          variant="secondary"
          disabled={busy || !fileUri.trim()}
          onPress={async () => {
            if (!fileUri.trim()) return;
            setBusy(true);
            setActionError(undefined);
            try {
              await restoreBackup(fileUri.trim());
            } catch (nextError) {
              setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel restaurar o backup.');
            } finally {
              setBusy(false);
            }
          }}
        />
      </AppCard>

      {actionError ? <EmptyState title="Backup" description={actionError} /> : null}

      {loading ? (
        <EmptyState title="Backup" description="Carregando..." />
      ) : error ? (
        <EmptyState title="Backup" description={error} />
      ) : backups.length === 0 ? (
        <EmptyState title="Backup" description="Nenhum backup criado ainda." />
      ) : (
        backups.map((backup) => (
          <AppCard key={backup.id}>
            <AppCard.Row
              icon="archive-outline"
              title={backup.fileName ?? backup.type}
              subtitle={formatShortDateTime(backup.createdAt)}
              trailing={<StatusBadge tone={backup.status === 'success' ? 'success' : 'danger'} label={backup.format} />}
            />
            <AppButton
              label="Compartilhar"
              disabled={busy || !backup.fileUri}
              onPress={async () => {
                if (backup.fileUri) {
                  setBusy(true);
                  setActionError(undefined);
                  try {
                    await shareBackup(backup.fileUri);
                  } catch (nextError) {
                    setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel compartilhar o backup.');
                  } finally {
                    setBusy(false);
                  }
                }
              }}
            />
          </AppCard>
        ))
      )}
    </ScreenContainer>
  );
}
