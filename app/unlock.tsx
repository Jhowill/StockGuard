import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { translateAppError } from '@/i18n/errorMessages';
import { useAppState } from '@/state/app-state';
import { authenticateWithBiometric, canUseBiometricUnlock, isBiometricEnabled, verifyPin } from '@/services/securityService';

export default function UnlockScreen() {
  const { t } = useI18n();
  const { unlockApp, biometricUnlockEnabled } = useAppState();
  const { palette } = useAppTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const available = await canUseBiometricUnlock();
        const enabled = await isBiometricEnabled();
        setBiometricAvailable(available && enabled && biometricUnlockEnabled);
      } catch {
        setBiometricAvailable(false);
      }
    })();
  }, [biometricUnlockEnabled]);

  const handleUnlock = async () => {
    if (busy) {
      return;
    }

    if (!pin.trim()) {
      setError(t('securityFlow.pinRequired'));
      return;
    }

    if (!/^\d{4,8}$/.test(pin.trim())) {
      setError(t('securityFlow.pinWrong'));
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      const ok = await verifyPin(pin.trim());
      if (!ok) {
        setError(t('securityFlow.pinWrong'));
        return;
      }

      unlockApp();
      router.replace('/(tabs)');
    } catch {
      setError(t('securityFlow.pinValidateFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handleBiometric = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      const result = await authenticateWithBiometric({
        promptMessage: t('securityFlow.unlockBiometricPrompt'),
        fallbackLabel: t('securityFlow.usePin'),
      });
      if (!result.success) {
        setError(t('securityFlow.biometricAuthFailed'));
        return;
      }

      unlockApp();
      router.replace('/(tabs)');
    } catch {
      setError(t('securityFlow.biometricAuthFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('securityFlow.unlockTitle')} subtitle={t('securityFlow.unlockSubtitle')} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="lock-closed-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>{t('securityFlow.unlockHeroTitle')}</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('securityFlow.unlockHeroBody')}</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label={t('securityFlow.appLocked')} />
          <StatusBadge tone={biometricAvailable ? 'success' : 'warning'} label={biometricAvailable ? t('securityFlow.biometricReady') : t('securityFlow.biometricUnavailable')} />
        </View>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <StatusBadge tone="info" label={t('securityFlow.appLocked')} />
        <AppCard.Text>{t('securityFlow.unlockBody')}</AppCard.Text>
        <AppInput label={t('securityFlow.pinTitle')} secureTextEntry keyboardType="number-pad" maxLength={8} value={pin} onChangeText={setPin} helperText={t('securityFlow.pinHelper')} placeholder={t('securityFlow.pinPlaceholder')} />
        <AppButton label={t('securityFlow.unlockPin')} loading={busy} onPress={() => void handleUnlock()} />
        {biometricAvailable ? <AppButton label={t('securityFlow.unlockBiometric')} variant="secondary" disabled={busy} onPress={() => void handleBiometric()} /> : null}
      </AppCard>

      {error ? <EmptyState title={t('securityFlow.unlockFailed')} description={translateAppError(error, t)} icon="lock-closed-outline" /> : null}
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
