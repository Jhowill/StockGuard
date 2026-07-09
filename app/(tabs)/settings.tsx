import { router } from 'expo-router';
import * as Application from 'expo-application';
import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSettings } from '@/hooks/useSettings';
import { useAppState } from '@/state/app-state';
import { getAdsConfig } from '@/config/ads';
import { deleteAllUserData } from '@/services/dataService';

export default function SettingsScreen() {
  const { settings, loading, error, saveSettings } = useSettings();
  const { appLockEnabled, biometricUnlockEnabled, hideFinancialValues } = useAppState();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const adsConfig = getAdsConfig();

  const safeSave = async (input: Parameters<typeof saveSettings>[0]) => {
    if (saving) {
      return;
    }

    setSaving(true);
    setActionError(undefined);
    try {
      await saveSettings(input);
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel salvar a configuracao.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAll = async () => {
    if (saving) {
      return;
    }

    setDeleteStep(0);
    setSaving(true);
    setActionError(undefined);
    try {
      await deleteAllUserData();
      await saveSettings({
        onboardingCompleted: false,
        usageType: 'other',
        hideFinancialValues: false,
      });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel apagar os dados.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Configuracoes" subtitle="Tema, idioma, seguranca, backup e dados." />

      {loading ? (
        <LoadingState title="Configuracoes" description="Carregando preferencias." />
      ) : error ? (
        <ErrorState title="Configuracoes" description={error} />
      ) : null}

      {actionError ? <ErrorState title="Configuracoes" description={actionError} /> : null}

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Aparencia</AppCard.Title>
        <StatusBadge tone="info" label={settings?.theme ?? '...'} />
        <AppButton label="Sistema" disabled={saving} variant={settings?.theme === 'system' ? 'primary' : 'ghost'} onPress={() => void safeSave({ theme: 'system' })} />
        <AppButton label="Claro" disabled={saving} variant={settings?.theme === 'light' ? 'primary' : 'ghost'} onPress={() => void safeSave({ theme: 'light' })} />
        <AppButton label="Escuro" disabled={saving} variant={settings?.theme === 'dark' ? 'primary' : 'ghost'} onPress={() => void safeSave({ theme: 'dark' })} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Idioma</AppCard.Title>
        <StatusBadge tone="info" label={settings?.language ?? '...'} />
        <AppButton label="PT-BR" disabled={saving} variant={settings?.language === 'pt-BR' ? 'primary' : 'ghost'} onPress={() => void safeSave({ language: 'pt-BR' })} />
        <AppButton label="EN" disabled={saving} variant={settings?.language === 'en' ? 'primary' : 'ghost'} onPress={() => void safeSave({ language: 'en' })} />
        <AppButton label="ES" disabled={saving} variant={settings?.language === 'es' ? 'primary' : 'ghost'} onPress={() => void safeSave({ language: 'es' })} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Moeda</AppCard.Title>
        <StatusBadge tone="success" label={settings?.currency ?? 'BRL'} />
        <AppButton label="BRL" disabled={saving} variant={settings?.currency === 'BRL' ? 'primary' : 'ghost'} onPress={() => void safeSave({ currency: 'BRL' })} />
        <AppButton label="USD" disabled={saving} variant={settings?.currency === 'USD' ? 'primary' : 'ghost'} onPress={() => void safeSave({ currency: 'USD' })} />
        <AppButton label="EUR" disabled={saving} variant={settings?.currency === 'EUR' ? 'primary' : 'ghost'} onPress={() => void safeSave({ currency: 'EUR' })} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Seguranca</AppCard.Title>
        <StatusBadge tone={appLockEnabled ? 'success' : 'info'} label={appLockEnabled ? 'PIN ativo' : 'PIN desativado'} />
        <AppButton label={appLockEnabled ? 'Gerenciar PIN' : 'Ativar PIN'} onPress={() => router.push('/security/pin')} />
        <AppButton label={biometricUnlockEnabled ? 'Gerenciar biometria' : 'Ativar biometria'} variant="secondary" onPress={() => router.push('/security/biometric')} />
        <AppButton label={hideFinancialValues ? 'Mostrar valores' : 'Ocultar valores'} disabled={saving} variant="ghost" onPress={() => void safeSave({ hideFinancialValues: !hideFinancialValues })} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Dados</AppCard.Title>
        <AppButton label="Backup" variant="secondary" onPress={() => router.push('/backup')} />
        <AppButton label="Premium e recompensas" variant="ghost" onPress={() => router.push('/premium')} />
        <AppButton
          label="Redefinir preferencias"
          variant="ghost"
          onPress={() =>
            void safeSave({
              onboardingCompleted: false,
              theme: 'system',
              language: 'system',
              currency: 'BRL',
              usageType: 'other',
              appLockEnabled: false,
              biometricUnlockEnabled: false,
              hideFinancialValues: false,
            })
          }
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Ads</AppCard.Title>
        <AppCard.Text>
          Pronto para receber IDs via app.config/app.json extra: EXPO_PUBLIC_ADMOB_ANDROID_APP_ID,
          EXPO_PUBLIC_ADMOB_IOS_APP_ID e unidades rewarded.
        </AppCard.Text>
        <StatusBadge tone={adsConfig.enabled ? 'success' : 'info'} label={adsConfig.enabled ? 'Ads configurado' : 'Ads aguardando IDs'} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Sobre</AppCard.Title>
        <AppCard.Text>Versao {Application.nativeApplicationVersion ?? '0.1.0'} ({Application.nativeBuildVersion ?? 'dev'})</AppCard.Text>
        <AppCard.Text>Politica de privacidade e termos de uso devem ser publicados antes da loja. Nenhum dado e enviado para servidor nesta V1 offline.</AppCard.Text>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Zona de perigo</AppCard.Title>
        <AppCard.Text>Apaga produtos, movimentacoes, categorias, fornecedores, backups registrados e recompensas locais.</AppCard.Text>
        <AppButton label="Apagar todos os dados" variant="secondary" disabled={saving} onPress={() => setDeleteStep(1)} />
      </AppCard>

      <ConfirmDialog
        visible={deleteStep === 1}
        title="Apagar todos os dados?"
        message="Esta acao remove dados operacionais deste aparelho. Faca um backup antes se quiser preservar o estoque."
        confirmLabel="Continuar"
        danger
        onCancel={() => setDeleteStep(0)}
        onConfirm={() => setDeleteStep(2)}
      />
      <ConfirmDialog
        visible={deleteStep === 2}
        title="Confirmacao final"
        message="Confirme novamente. Depois de apagar, a recuperacao so sera possivel com um backup valido."
        confirmLabel="Apagar agora"
        danger
        onCancel={() => setDeleteStep(0)}
        onConfirm={() => void handleDeleteAll()}
      />
    </ScreenContainer>
  );
}
