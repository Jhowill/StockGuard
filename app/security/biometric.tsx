import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { useSettings } from '@/hooks/useSettings';
import { authenticateWithBiometric, canUseBiometricUnlock, disableBiometricLock, enableBiometricLock } from '@/services/securityService';

export default function BiometricSecurityScreen() {
  const { settings, saveSettings } = useSettings();
  const { t } = useI18n();
  const { palette } = useAppTheme();
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    void (async () => {
      try {
        setAvailable(await canUseBiometricUnlock());
      } catch {
        setAvailable(false);
      }
    })();
  }, []);

  const enable = async () => {
    if (busy) {
      return;
    }

    if (!available) {
      setError(t('securityFlow.biometricNotAvailable'));
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      const result = await authenticateWithBiometric();
      if (!result.success) {
        setError(t('securityFlow.biometricValidateFailed'));
        return;
      }

      await enableBiometricLock();
      await saveSettings({ biometricUnlockEnabled: true });
      router.back();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t('securityFlow.biometricEnableFailed'));
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      await disableBiometricLock();
      await saveSettings({ biometricUnlockEnabled: false });
      router.back();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t('securityFlow.biometricDisableFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('securityFlow.biometricTitle')} subtitle={t('securityFlow.biometricSubtitle')} variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="finger-print-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>{t('securityFlow.biometricHeroTitle')}</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('securityFlow.biometricHeroBody')}</Text>
        </View>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <StatusBadge tone={settings?.biometricUnlockEnabled ? 'success' : 'info'} label={settings?.biometricUnlockEnabled ? t('securityFlow.biometricEnabled') : t('securityFlow.biometricDisabled')} />
        <StatusBadge tone={available ? 'success' : 'warning'} label={available ? t('securityFlow.available') : t('securityFlow.unavailable')} />
        <AppCard.Text>{t('securityFlow.biometricBody')}</AppCard.Text>
        <AppButton label={busy ? '...' : t('securityFlow.enableBiometric')} disabled={busy || !available} onPress={() => void enable()} />
        <AppButton label={t('securityFlow.disableBiometric')} variant="secondary" disabled={busy} onPress={() => void disable()} />
      </AppCard>

      {error ? <EmptyState title={t('settings.security')} description={error} icon="finger-print-outline" /> : null}
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
});
