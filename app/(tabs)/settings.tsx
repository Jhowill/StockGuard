import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getAdsConfig } from '@/config/ads';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppSelect } from '@/components/ui/AppSelect';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSettings } from '@/hooks/useSettings';
import { useAppState, type AppLanguage, type CurrencyCode, type ThemeMode } from '@/state/app-state';
import { deleteAllUserData } from '@/services/dataService';

export default function SettingsScreen() {
  const { settings, loading, error, saveSettings } = useSettings();
  const { appLockEnabled, biometricUnlockEnabled, hideFinancialValues } = useAppState();
  const { palette } = useAppTheme();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const adsConfig = getAdsConfig();

  const currentTheme = (settings?.theme ?? 'system') as ThemeMode;
  const currentLanguage = (settings?.language ?? 'system') as AppLanguage;
  const currentCurrency = (settings?.currency ?? 'BRL') as CurrencyCode;

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
        theme: 'system',
        language: 'system',
        currency: 'BRL',
        onboardingCompleted: false,
        appLockEnabled: false,
        biometricUnlockEnabled: false,
        usageType: 'other',
        hideFinancialValues: false,
        adsEnabled: true,
        personalizedAdsConsent: 'unknown',
        expirationWarningDays: 7,
        lowStockWarningEnabled: true,
        expirationWarningEnabled: true,
        backupReminderEnabled: false,
        lastBackupAt: null,
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

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="settings-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Tudo centralizado para personalizar o app</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>Ajuste aparencia, idioma, moeda, seguranca e backups em um so lugar.</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label={currentTheme} />
          <StatusBadge tone="info" label={currentLanguage} />
          <StatusBadge tone="success" label={currentCurrency} />
        </View>
      </AppCard>

      {loading ? (
        <LoadingState title="Configuracoes" description="Carregando preferencias." />
      ) : error ? (
        <ErrorState title="Configuracoes" description={error} />
      ) : null}

      {actionError ? <ErrorState title="Configuracoes" description={actionError} /> : null}

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Aparencia</AppCard.Title>
        <AppCard.Text>Escolha como o app deve se apresentar na sua rotina.</AppCard.Text>
        <AppSelect
          label="Tema"
          value={currentTheme}
          options={[
            { value: 'system', label: 'Sistema' },
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Escuro' },
          ]}
          disabled={saving}
          onChange={(value) => void safeSave({ theme: value })}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Idioma</AppCard.Title>
        <AppCard.Text>Textos, atalhos e mensagens do sistema.</AppCard.Text>
        <AppSelect
          label="Idioma"
          value={currentLanguage}
          options={[
            { value: 'system', label: 'Sistema' },
            { value: 'pt-BR', label: 'PT-BR' },
            { value: 'en', label: 'EN' },
            { value: 'es', label: 'ES' },
          ]}
          disabled={saving}
          onChange={(value) => void safeSave({ language: value })}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Moeda</AppCard.Title>
        <AppCard.Text>Usada nos campos de valores e nos relatorios.</AppCard.Text>
        <AppSelect
          label="Moeda"
          value={currentCurrency}
          options={[
            { value: 'BRL', label: 'BRL' },
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
          ]}
          disabled={saving}
          onChange={(value) => void safeSave({ currency: value })}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Seguranca</AppCard.Title>
        <AppCard.Text>Proteja o acesso com PIN ou biometria.</AppCard.Text>
        <StatusBadge tone={appLockEnabled ? 'success' : 'info'} label={appLockEnabled ? 'PIN ativo' : 'PIN desativado'} />
        <AppButton label={appLockEnabled ? 'Gerenciar PIN' : 'Ativar PIN'} onPress={() => router.push('/security/pin')} />
        <AppButton label={biometricUnlockEnabled ? 'Gerenciar biometria' : 'Ativar biometria'} variant="secondary" onPress={() => router.push('/security/biometric')} />
        <AppButton label={hideFinancialValues ? 'Mostrar valores' : 'Ocultar valores'} disabled={saving} variant="ghost" onPress={() => void safeSave({ hideFinancialValues: !hideFinancialValues })} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Dados</AppCard.Title>
        <AppCard.Text>Backup, exportacao e outras saidas de informacao.</AppCard.Text>
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
        <AppCard.Text>Apenas se voce quiser recomeçar do zero neste aparelho.</AppCard.Text>
        <AppCard.Text>Apaga produtos, movimentacoes, categorias, fornecedores, backups registrados e recompensas locais.</AppCard.Text>
        <AppButton label="Apagar todos os dados" variant="danger" disabled={saving} onPress={() => setDeleteStep(1)} />
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
