import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { AdPolicyNotice } from '@/components/ads/AdPolicyNotice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { useBackup } from '@/hooks/useBackup';
import { useI18n } from '@/hooks/useI18n';
import { translateAppError } from '@/i18n/errorMessages';
import { showRewardedInterstitial } from '@/services/adsService';
import { consumeFeatureUse, grantFeatureUnlock } from '@/services/rewardedAccessService';
import { formatShortDateTime } from '@/utils/date-format';

export default function BackupScreen() {
  const { t, language } = useI18n();
  const { palette } = useAppTheme();
  const { backups, loading, error, createBackup, restoreBackup, shareBackup } = useBackup();
  const { canUseFeature } = useFeatureGate('encrypted_backup');
  const [fileUri, setFileUri] = useState('');
  const [password, setPassword] = useState('');
  const [restoreStep, setRestoreStep] = useState<0 | 1 | 2>(0);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const latestBackup = backups[0];

  const formatBackupLabel = (backup: { encrypted: boolean; format: string }) => {
    if (backup.format === 'encrypted_json' || backup.encrypted) {
      return t('backup.formatEncryptedJson');
    }

    if (backup.format === 'json') {
      return t('backup.formatJson');
    }

    return backup.format;
  };

  const pickBackupFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setFileUri(result.assets[0]?.uri ?? '');
      }
    } catch {
      setActionError(t('backup.selectFailed'));
    }
  };

  const handleCreate = async (encrypted: boolean) => {
    setBusy(true);
    setActionError(undefined);
    setSuccess(undefined);
    try {
      if (encrypted) {
        const allowed = await canUseFeature('encrypted_backup');
        if (!allowed) {
          const adResult = await showRewardedInterstitial('encrypted_backup');
          if (adResult.status !== 'success') {
            const reason = adResult.status === 'failed' ? adResult.reason : t('backup.encryptedAdRequired');
            throw new Error(reason);
          }
          await grantFeatureUnlock('encrypted_backup');
        }
      }

      const result = await createBackup(encrypted ? password : undefined);
      if (encrypted) {
        await consumeFeatureUse('encrypted_backup');
      }
      setFileUri(result.fileUri);
      setSuccess(encrypted ? t('backup.encryptedCreated') : t('backup.created'));
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : t('backup.createFailed'));
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
      setSuccess(t('backup.restored'));
      setRestoreStep(0);
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : t('backup.restoreFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('backup.title')} subtitle={t('backup.subtitle')} variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="archive-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>{t('backup.heroTitle')}</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('backup.heroBody')}</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone={latestBackup ? 'success' : 'info'} label={latestBackup ? t('backup.recent') : t('backup.none')} />
          <StatusBadge tone="info" label={t('backup.files', { count: backups.length })} />
        </View>
      </AppCard>

      <AdPolicyNotice title={t('ads.backupTitle')} body={t('ads.backupBody')} icon="lock-closed-outline" tone="reward" />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('backup.create')}</AppCard.Title>
        <AppCard.Text>{t('backup.createBody')}</AppCard.Text>
        <AppInput
          label={t('backup.optionalPassword')}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder={t('backup.passwordPlaceholder')}
          helperText={t('backup.passwordHelper')}
        />
        <AppButton label={busy ? '...' : t('backup.simple')} disabled={busy} onPress={() => void handleCreate(false)} />
        <AppButton label={busy ? '...' : t('backup.encrypted')} variant="secondary" disabled={busy || password.trim().length < 6} onPress={() => void handleCreate(true)} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('backup.restore')}</AppCard.Title>
        <AppCard.Text>{t('backup.restoreBody')}</AppCard.Text>
        <AppButton label={t('backup.selectFile')} variant="secondary" disabled={busy} onPress={() => void pickBackupFile()} />
        <AppInput label={t('backup.filePath')} value={fileUri} onChangeText={setFileUri} helperText={t('backup.filePathHelper')} />
        <AppInput label={t('backup.encryptedPassword')} secureTextEntry value={password} onChangeText={setPassword} helperText={t('backup.encryptedPasswordHelper')} />
        <AppButton label={t('backup.restore')} variant="secondary" disabled={busy || !fileUri.trim()} onPress={() => setRestoreStep(1)} />
      </AppCard>

      {success ? <EmptyState title={t('backup.title')} description={success} icon="checkmark-circle-outline" /> : null}
      {actionError ? <ErrorState title={t('backup.title')} description={translateAppError(actionError, t)} icon="archive-outline" /> : null}

      {loading ? (
        <LoadingState title={t('backup.title')} description={t('common.loading')} />
      ) : error ? (
        <ErrorState title={t('backup.title')} description={translateAppError(error, t)} icon="archive-outline" />
      ) : backups.length === 0 ? (
        <EmptyState title={t('backup.title')} description={t('backup.noBackups')} icon="archive-outline" />
      ) : (
        backups.map((backup) => (
          <AppCard key={backup.id}>
            <AppCard.Row
              icon="archive-outline"
              title={backup.fileName ?? backup.type}
              subtitle={formatShortDateTime(backup.createdAt, language)}
              trailing={<StatusBadge tone={backup.status === 'success' ? 'success' : 'danger'} label={formatBackupLabel(backup)} />}
            />
            <AppButton
              label={t('common.share')}
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
                  setActionError(nextError instanceof Error ? nextError.message : t('backup.shareFailed'));
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
        title={t('backup.restoreTitle')}
        message={t('backup.restoreConfirm')}
        confirmLabel={t('common.continue')}
        danger
        onCancel={() => setRestoreStep(0)}
        onConfirm={() => setRestoreStep(2)}
      />
      <ConfirmDialog
        visible={restoreStep === 2}
        title={t('backup.finalTitle')}
        message={t('backup.finalBody')}
        confirmLabel={t('backup.restoreNow')}
        danger
        onCancel={() => setRestoreStep(0)}
        onConfirm={() => void handleRestore()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 14,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    gap: 4,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
