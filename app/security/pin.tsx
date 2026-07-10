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
import { useSettings } from '@/hooks/useSettings';
import { clearPin, setPin } from '@/services/securityService';

export default function PinSecurityScreen() {
  const { settings, saveSettings } = useSettings();
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
      setError('O PIN precisa ter pelo menos 4 digitos.');
      return;
    }

    if (pin.trim() !== confirmPin.trim()) {
      setError('Os PINs nao conferem.');
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      await setPin(pin.trim());
      await saveSettings({ appLockEnabled: true });
      router.back();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Nao foi possivel salvar o PIN.');
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
      setError(nextError instanceof Error ? nextError.message : 'Nao foi possivel remover o PIN.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="PIN" subtitle="Configure a trava principal do app." variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="lock-closed-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Crie uma senha rapida e direta para o acesso</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>O PIN protege o app com uma camada simples e facil de lembrar.</Text>
        </View>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <StatusBadge tone={settings?.appLockEnabled ? 'success' : 'info'} label={settings?.appLockEnabled ? 'Ativado' : 'Desativado'} />
        <AppCard.Text>Use um PIN numérico com pelo menos 4 dígitos.</AppCard.Text>
        <AppInput label="Novo PIN" secureTextEntry keyboardType="number-pad" value={pin} onChangeText={setPinValue} helperText="Ex.: 1234" />
        <AppInput label="Confirmar PIN" secureTextEntry keyboardType="number-pad" value={confirmPin} onChangeText={setConfirmPin} helperText="Digite o mesmo PIN novamente." />
        <AppButton label={busy ? '...' : 'Salvar PIN'} disabled={busy} onPress={() => void save()} />
        <AppButton label="Remover PIN" variant="secondary" disabled={busy} onPress={() => void remove()} />
      </AppCard>

      {error ? <EmptyState title="Seguranca" description={error} icon="lock-closed-outline" /> : null}
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
