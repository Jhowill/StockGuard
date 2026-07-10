import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSettings } from '@/hooks/useSettings';
import { authenticateWithBiometric, canUseBiometricUnlock, disableBiometricLock, enableBiometricLock } from '@/services/securityService';

export default function BiometricSecurityScreen() {
  const { settings, saveSettings } = useSettings();
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
      setError('Biometria nao disponivel neste aparelho.');
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      const result = await authenticateWithBiometric();
      if (!result.success) {
        setError('Nao foi possivel validar a biometria.');
        return;
      }

      await enableBiometricLock();
      await saveSettings({ biometricUnlockEnabled: true });
      router.back();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Nao foi possivel ativar a biometria.');
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
      setError(nextError instanceof Error ? nextError.message : 'Nao foi possivel desativar a biometria.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Biometria" subtitle="Use a biometria do aparelho para desbloquear." variant="page" onBackPress={() => router.back()} />

      <AppCard style={{ gap: 12 }}>
        <StatusBadge tone={settings?.biometricUnlockEnabled ? 'success' : 'info'} label={settings?.biometricUnlockEnabled ? 'Ativada' : 'Desativada'} />
        <StatusBadge tone={available ? 'success' : 'warning'} label={available ? 'Disponivel neste aparelho' : 'Nao disponivel'} />
        <AppCard.Text>Quando ativada, a biometria facilita o desbloqueio sem digitar o PIN.</AppCard.Text>
        <AppButton label={busy ? '...' : 'Ativar biometria'} disabled={busy || !available} onPress={() => void enable()} />
        <AppButton label="Desativar biometria" variant="secondary" disabled={busy} onPress={() => void disable()} />
      </AppCard>

      {error ? <EmptyState title="Seguranca" description={error} icon="finger-print-outline" /> : null}
    </ScreenContainer>
  );
}
