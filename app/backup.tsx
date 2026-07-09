import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useBackup } from '@/hooks/useBackup';
import { formatShortDateTime } from '@/utils/date-format';

export default function BackupScreen() {
  const { backups, loading, error, createBackup, restoreBackup, shareBackup } = useBackup();
  const [fileUri, setFileUri] = useState('');
  const [password, setPassword] = useState('');
  const [restoreStep, setRestoreStep] = useState<0 | 1 | 2>(0);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const pickBackupFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      setFileUri(result.assets[0]?.uri ?? '');
    }
  };

  const handleCreate = async (encrypted: boolean) => {
    setBusy(true);
    setActionError(undefined);
    setSuccess(undefined);
    try {
      const result = await createBackup(encrypted ? password : undefined);
      setFileUri(result.fileUri);
      setSuccess(encrypted ? 'Backup criptografado criado.' : 'Backup criado.');
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel gerar o backup.');
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (!fileUri.trim()) {
      return;
    }

    setBusy(true);
    setActionError(undefined);
    setSuccess(undefined);
    try {
      await restoreBackup(fileUri.trim(), password || undefined);
      setSuccess('Backup restaurado com sucesso.');
      setRestoreStep(0);
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel restaurar o backup.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Backup" subtitle="Exportacao e restauracao local." />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Criar backup</AppCard.Title>
        <AppCard.Text>Gere um arquivo local com produtos, categorias, fornecedores, movimentacoes e configuracoes.</AppCard.Text>
        <AppInput label="Senha opcional" secureTextEntry value={password} onChangeText={setPassword} placeholder="Preencha para criptografar" />
        <AppButton label={busy ? '...' : 'Gerar backup simples'} disabled={busy} onPress={() => void handleCreate(false)} />
        <AppButton label={busy ? '...' : 'Gerar backup criptografado'} variant="secondary" disabled={busy || password.trim().length < 6} onPress={() => void handleCreate(true)} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Restaurar backup</AppCard.Title>
        <AppCard.Text>A restauracao valida o arquivo e cria um backup automatico antes de substituir os dados atuais.</AppCard.Text>
        <AppButton label="Selecionar arquivo" variant="secondary" disabled={busy} onPress={() => void pickBackupFile()} />
        <AppInput label="Caminho do arquivo" value={fileUri} onChangeText={setFileUri} />
        <AppInput label="Senha do backup criptografado" secureTextEntry value={password} onChangeText={setPassword} />
        <AppButton
          label="Restaurar"
          variant="secondary"
          disabled={busy || !fileUri.trim()}
          onPress={() => setRestoreStep(1)}
        />
      </AppCard>

      {success ? <EmptyState title="Backup" description={success} /> : null}
      {actionError ? <ErrorState title="Backup" description={actionError} /> : null}

      {loading ? (
        <LoadingState title="Backup" description="Carregando backups locais." />
      ) : error ? (
        <ErrorState title="Backup" description={error} />
      ) : backups.length === 0 ? (
        <EmptyState title="Backup" description="Nenhum backup criado ainda." />
      ) : (
        backups.map((backup) => (
          <AppCard key={backup.id}>
            <AppCard.Row
              icon="archive-outline"
              title={backup.fileName ?? backup.type}
              subtitle={formatShortDateTime(backup.createdAt)}
              trailing={<StatusBadge tone={backup.status === 'success' ? 'success' : 'danger'} label={backup.encrypted ? 'seguro' : backup.format} />}
            />
            <AppButton
              label="Compartilhar"
              disabled={busy || !backup.fileUri}
              onPress={async () => {
                if (!backup.fileUri) {
                  return;
                }
                setBusy(true);
                setActionError(undefined);
                try {
                  await shareBackup(backup.fileUri);
                } catch (nextError) {
                  setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel compartilhar o backup.');
                } finally {
                  setBusy(false);
                }
              }}
            />
          </AppCard>
        ))
      )}

      <ConfirmDialog
        visible={restoreStep === 1}
        title="Restaurar backup?"
        message="Esta acao pode substituir produtos, movimentacoes, categorias e configuracoes atuais. Um backup automatico sera criado antes."
        confirmLabel="Continuar"
        danger
        onCancel={() => setRestoreStep(0)}
        onConfirm={() => setRestoreStep(2)}
      />
      <ConfirmDialog
        visible={restoreStep === 2}
        title="Confirmacao final"
        message="Confirme novamente para restaurar. Arquivos invalidos serao recusados antes de alterar o banco."
        confirmLabel="Restaurar agora"
        danger
        onCancel={() => setRestoreStep(0)}
        onConfirm={() => void handleRestore()}
      />
    </ScreenContainer>
  );
}
