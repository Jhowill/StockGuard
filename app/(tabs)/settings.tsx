import { router } from 'expo-router';
import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSettings } from '@/hooks/useSettings';
import { useAppState } from '@/state/app-state';

export default function SettingsScreen() {
  const { settings, loading, error, saveSettings } = useSettings();
  const { appLockEnabled, biometricUnlockEnabled, hideFinancialValues } = useAppState();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();

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

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Configuracoes" subtitle="Tema, idioma, seguranca, backup e dados." />

      {loading ? (
        <EmptyState title="Configuracoes" description="Carregando..." />
      ) : error ? (
        <EmptyState title="Configuracoes" description={error} />
      ) : null}

      {actionError ? <EmptyState title="Configuracoes" description={actionError} /> : null}

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
    </ScreenContainer>
  );
}
