import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
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
import { useSettings } from '@/hooks/useSettings';
import { clearPin, setPin } from '@/services/securityService';

export default function PinSecurityScreen() {
  const { settings, saveSettings } = useSettings();
  const { t } = useI18n();
  const { palette } = useAppTheme();
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (busy) {
      return;
    }

    if (pin.trim().length < 4) {
      setError(t('securityFlow.pinShort'));
      return;
    }

    if (pin.trim() !== confirmPin.trim()) {
      setError(t('securityFlow.pinMismatch'));
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      await setPin(pin.trim());
      await saveSettings({ appLockEnabled: true });
      router.back();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t('securityFlow.pinSaveFailed'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      await clearPin();
      await saveSettings({ appLockEnabled: false, biometricUnlockEnabled: false });
      router.back();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t('securityFlow.pinRemoveFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('securityFlow.pinTitle')} subtitle={t('securityFlow.pinSubtitle')} variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="lock-closed-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>{t('securityFlow.pinHeroTitle')}</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('securityFlow.pinHeroBody')}</Text>
        </View>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <StatusBadge tone={settings?.appLockEnabled ? 'success' : 'info'} label={settings?.appLockEnabled ? t('securityFlow.enabled') : t('securityFlow.disabled')} />
        <AppCard.Text>{t('securityFlow.pinBody')}</AppCard.Text>
        <AppInput label={t('securityFlow.newPin')} secureTextEntry keyboardType="number-pad" value={pin} onChangeText={setPinValue} helperText={t('securityFlow.pinExample')} />
        <AppInput label={t('securityFlow.confirmPin')} secureTextEntry keyboardType="number-pad" value={confirmPin} onChangeText={setConfirmPin} helperText={t('securityFlow.confirmPinHelper')} />
        <AppButton label={busy ? '...' : t('securityFlow.savePin')} disabled={busy} onPress={() => void save()} />
        <AppButton label={t('securityFlow.removePin')} variant="secondary" disabled={busy} onPress={() => void remove()} />
      </AppCard>

      {error ? <EmptyState title={t('settings.security')} description={translateAppError(error, t)} icon="lock-closed-outline" /> : null}
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
