import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsScreen() {
  const { settings, loading, error, saveSettings } = useSettings();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Configuracoes" subtitle="Tema, idioma, seguranca, backup e dados." />

      {loading ? (
        <EmptyState title="Configuracoes" description="Carregando..." />
      ) : error ? (
        <EmptyState title="Configuracoes" description={error} />
      ) : null}

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Aparencia</AppCard.Title>
        <StatusBadge tone="info" label={settings?.theme ?? '...'} />
        <AppButton label="Sistema" variant={settings?.theme === 'system' ? 'primary' : 'ghost'} onPress={() => void saveSettings({ theme: 'system' })} />
        <AppButton label="Claro" variant={settings?.theme === 'light' ? 'primary' : 'ghost'} onPress={() => void saveSettings({ theme: 'light' })} />
        <AppButton label="Escuro" variant={settings?.theme === 'dark' ? 'primary' : 'ghost'} onPress={() => void saveSettings({ theme: 'dark' })} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Idioma</AppCard.Title>
        <StatusBadge tone="info" label={settings?.language ?? '...'} />
        <AppButton label="PT-BR" variant={settings?.language === 'pt-BR' ? 'primary' : 'ghost'} onPress={() => void saveSettings({ language: 'pt-BR' })} />
        <AppButton label="EN" variant={settings?.language === 'en' ? 'primary' : 'ghost'} onPress={() => void saveSettings({ language: 'en' })} />
        <AppButton label="ES" variant={settings?.language === 'es' ? 'primary' : 'ghost'} onPress={() => void saveSettings({ language: 'es' })} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Moeda</AppCard.Title>
        <StatusBadge tone="success" label={settings?.currency ?? 'BRL'} />
        <AppButton label="BRL" variant={settings?.currency === 'BRL' ? 'primary' : 'ghost'} onPress={() => void saveSettings({ currency: 'BRL' })} />
        <AppButton label="USD" variant={settings?.currency === 'USD' ? 'primary' : 'ghost'} onPress={() => void saveSettings({ currency: 'USD' })} />
        <AppButton label="EUR" variant={settings?.currency === 'EUR' ? 'primary' : 'ghost'} onPress={() => void saveSettings({ currency: 'EUR' })} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Seguranca</AppCard.Title>
        <StatusBadge tone={settings?.appLockEnabled ? 'success' : 'info'} label={settings?.appLockEnabled ? 'PIN ativo' : 'PIN desativado'} />
        <AppButton label={settings?.appLockEnabled ? 'Desativar PIN' : 'Ativar PIN'} onPress={() => void saveSettings({ appLockEnabled: !settings?.appLockEnabled })} />
        <AppButton
          label={settings?.biometricUnlockEnabled ? 'Desativar biometria' : 'Ativar biometria'}
          variant="secondary"
          onPress={() => void saveSettings({ biometricUnlockEnabled: !settings?.biometricUnlockEnabled })}
        />
        <AppButton
          label={settings?.hideFinancialValues ? 'Mostrar valores' : 'Ocultar valores'}
          variant="ghost"
          onPress={() => void saveSettings({ hideFinancialValues: !settings?.hideFinancialValues })}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Dados</AppCard.Title>
        <AppButton label="Backup" variant="secondary" onPress={() => router.push('/backup')} />
        <AppButton label="Premium e recompensas" variant="ghost" onPress={() => router.push('/premium')} />
        <AppButton
          label="Reiniciar demonstracao"
          variant="ghost"
          onPress={() =>
            void saveSettings({
              onboardingCompleted: false,
              theme: 'system',
              language: 'system',
              currency: 'BRL',
              usageType: 'other',
            })
          }
        />
      </AppCard>
    </ScreenContainer>
  );
}
