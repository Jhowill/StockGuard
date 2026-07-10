import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getAdsConfig } from '@/config/ads';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { useSettings } from '@/hooks/useSettings';
import { useAppState, type AppLanguage, type CurrencyCode, type ThemeMode } from '@/state/app-state';
import { deleteAllUserData } from '@/services/dataService';

export default function SettingsScreen() {
  const { t } = useI18n();
  const { settings, loading, error, saveSettings } = useSettings();
  const { appLockEnabled, biometricUnlockEnabled, hideFinancialValues } = useAppState();
  const { palette } = useAppTheme();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [profileName, setProfileName] = useState('');
  const adsConfig = getAdsConfig();

  const currentTheme = (settings?.theme ?? 'system') as ThemeMode;
  const currentLanguage = (settings?.language ?? 'system') as AppLanguage;
  const currentCurrency = (settings?.currency ?? 'BRL') as CurrencyCode;
  const currentUserName = settings?.userName ?? '';

  useEffect(() => {
    setProfileName(currentUserName);
  }, [currentUserName]);

  const safeSave = async (input: Parameters<typeof saveSettings>[0]) => {
    if (saving) {
      return;
    }

    setSaving(true);
    setActionError(undefined);
    try {
      await saveSettings(input);
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : t('settings.saveFailed'));
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
        userName: null,
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
      setActionError(nextError instanceof Error ? nextError.message : t('settings.deleteFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="settings-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>{t('settings.heroTitle')}</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('settings.heroBody')}</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label={currentTheme} />
          <StatusBadge tone="info" label={currentLanguage} />
          <StatusBadge tone="success" label={currentCurrency} />
        </View>
      </AppCard>

      {loading ? (
        <LoadingState title={t('settings.title')} description={t('common.loading')} />
      ) : error ? (
        <ErrorState title={t('settings.title')} description={error} />
      ) : null}

      {actionError ? <ErrorState title={t('settings.title')} description={actionError} /> : null}

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.profile')}</AppCard.Title>
        <AppCard.Text>{t('settings.profileBody')}</AppCard.Text>
        <AppInput
          label={t('settings.homeName')}
          placeholder={t('settings.homeNamePlaceholder')}
          value={profileName}
          editable={!saving}
          onChangeText={setProfileName}
          onBlur={() => {
            const nextName = profileName.trim();
            if (nextName !== currentUserName) {
              void safeSave({ userName: nextName || null });
            }
          }}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.appearance')}</AppCard.Title>
        <AppCard.Text>{t('settings.appearanceBody')}</AppCard.Text>
        <AppSelect
          label={t('settings.theme')}
          value={currentTheme}
          options={[
            { value: 'system', label: t('settings.themeSystem') },
            { value: 'light', label: t('settings.themeLight') },
            { value: 'dark', label: t('settings.themeDark') },
          ]}
          disabled={saving}
          onChange={(value) => void safeSave({ theme: value })}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.language')}</AppCard.Title>
        <AppCard.Text>{t('settings.languageBody')}</AppCard.Text>
        <AppSelect
          label={t('settings.language')}
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
        <AppCard.Title>{t('settings.currency')}</AppCard.Title>
        <AppCard.Text>{t('settings.currencyBody')}</AppCard.Text>
        <AppSelect
          label={t('settings.currency')}
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
        <AppCard.Title>{t('settings.security')}</AppCard.Title>
        <AppCard.Text>{t('settings.securityBody')}</AppCard.Text>
        <StatusBadge tone={appLockEnabled ? 'success' : 'info'} label={appLockEnabled ? t('settings.pinActive') : t('settings.pinInactive')} />
        <AppButton label={appLockEnabled ? t('settings.managePin') : t('settings.enablePin')} onPress={() => router.push('/security/pin')} />
        <AppButton label={biometricUnlockEnabled ? t('settings.manageBiometric') : t('settings.enableBiometric')} variant="secondary" onPress={() => router.push('/security/biometric')} />
        <AppButton label={hideFinancialValues ? t('settings.showValues') : t('settings.hideValues')} disabled={saving} variant="ghost" onPress={() => void safeSave({ hideFinancialValues: !hideFinancialValues })} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.data')}</AppCard.Title>
        <AppCard.Text>{t('settings.dataBody')}</AppCard.Text>
        <AppButton label={t('settings.backup')} variant="secondary" onPress={() => router.push('/backup')} />
        <AppButton label={t('settings.premium')} variant="ghost" onPress={() => router.push('/premium')} />
        <AppButton
          label={t('settings.resetPreferences')}
          variant="ghost"
          onPress={() =>
            void safeSave({
              onboardingCompleted: false,
              userName: null,
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
        <AppCard.Title>{t('settings.ads')}</AppCard.Title>
        <AppCard.Text>{t('settings.adsBody')}</AppCard.Text>
        <StatusBadge tone={adsConfig.enabled ? 'success' : 'info'} label={adsConfig.enabled ? t('settings.adsConfigured') : t('settings.adsWaiting')} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.about')}</AppCard.Title>
        <AppCard.Text>{t('settings.version', { version: Application.nativeApplicationVersion ?? '0.1.0', build: Application.nativeBuildVersion ?? 'dev' })}</AppCard.Text>
        <AppCard.Text>{t('settings.privacyNote')}</AppCard.Text>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.dangerZone')}</AppCard.Title>
        <AppCard.Text>{t('settings.dangerBody')}</AppCard.Text>
        <AppCard.Text>{t('settings.dangerDetails')}</AppCard.Text>
        <AppButton label={t('settings.deleteAll')} variant="danger" disabled={saving} onPress={() => setDeleteStep(1)} />
      </AppCard>

      <ConfirmDialog
        visible={deleteStep === 1}
        title={t('settings.deleteTitle')}
        message={t('settings.deleteBody')}
        confirmLabel={t('common.continue')}
        danger
        onCancel={() => setDeleteStep(0)}
        onConfirm={() => setDeleteStep(2)}
      />
      <ConfirmDialog
        visible={deleteStep === 2}
        title={t('settings.finalConfirm')}
        message={t('settings.finalDeleteBody')}
        confirmLabel={t('settings.deleteNow')}
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
