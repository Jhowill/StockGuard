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

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Backup" subtitle="Exportacao e restauracao local." />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Criar backup</AppCard.Title>
        <AppCard.Text>Gere um arquivo local com produtos, categorias, fornecedores e configuracoes.</AppCard.Text>
        <AppButton
          label={busy ? '...' : 'Gerar backup'}
          onPress={async () => {
            setBusy(true);
            try {
              const result = await createBackup();
              setFileUri(result.fileUri);
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
          onPress={async () => {
            if (!fileUri) return;
            setBusy(true);
            try {
              await restoreBackup(fileUri);
            } finally {
              setBusy(false);
            }
          }}
        />
      </AppCard>

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
              onPress={async () => {
                if (backup.fileUri) {
                  await shareBackup(backup.fileUri);
                }
              }}
            />
          </AppCard>
        ))
      )}
    </ScreenContainer>
  );
}
