import { router } from 'expo-router';
import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSettings } from '@/hooks/useSettings';
import { clearPin, setPin } from '@/services/securityService';

export default function PinSecurityScreen() {
  const { settings, saveSettings } = useSettings();
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
      <AppHeader title="PIN" subtitle="Configure a trava principal do app." />

      <AppCard style={{ gap: 12 }}>
        <StatusBadge tone={settings?.appLockEnabled ? 'success' : 'info'} label={settings?.appLockEnabled ? 'Ativado' : 'Desativado'} />
        <AppInput label="Novo PIN" secureTextEntry keyboardType="number-pad" value={pin} onChangeText={setPinValue} />
        <AppInput label="Confirmar PIN" secureTextEntry keyboardType="number-pad" value={confirmPin} onChangeText={setConfirmPin} />
        <AppButton label={busy ? '...' : 'Salvar PIN'} disabled={busy} onPress={() => void save()} />
        <AppButton label="Remover PIN" variant="secondary" disabled={busy} onPress={() => void remove()} />
      </AppCard>

      {error ? <EmptyState title="Seguranca" description={error} /> : null}
    </ScreenContainer>
  );
}
