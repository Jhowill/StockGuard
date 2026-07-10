import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppState } from '@/state/app-state';
import { authenticateWithBiometric, canUseBiometricUnlock, isBiometricEnabled, verifyPin } from '@/services/securityService';

export default function UnlockScreen() {
  const { unlockApp, biometricUnlockEnabled } = useAppState();
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
      setError('Digite o PIN para continuar.');
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      const ok = await verifyPin(pin.trim());
      if (!ok) {
        setError('PIN incorreto.');
        return;
      }

      unlockApp();
      router.replace('/(tabs)');
    } catch {
      setError('Nao foi possivel validar o PIN agora.');
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
      const result = await authenticateWithBiometric();
      if (!result.success) {
        setError('Nao foi possivel autenticar com biometria.');
        return;
      }

      unlockApp();
      router.replace('/(tabs)');
    } catch {
      setError('Nao foi possivel autenticar com biometria.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Desbloquear" subtitle="Proteja seu estoque com PIN ou biometria." />

      <AppCard style={{ gap: 12 }}>
        <StatusBadge tone="info" label="App bloqueado" />
        <AppCard.Text>Digite o PIN ou use a biometria, se estiver configurada.</AppCard.Text>
        <AppInput label="PIN" secureTextEntry keyboardType="number-pad" value={pin} onChangeText={setPin} helperText="Somente números." placeholder="0000" />
        <AppButton label={busy ? '...' : 'Desbloquear com PIN'} disabled={busy} onPress={() => void handleUnlock()} />
        {biometricAvailable ? <AppButton label="Desbloquear com biometria" variant="secondary" disabled={busy} onPress={() => void handleBiometric()} /> : null}
      </AppCard>

      {error ? (
        <EmptyState title="Nao foi possivel desbloquear" description={error} icon="lock-closed-outline" />
      ) : null}
    </ScreenContainer>
  );
}
