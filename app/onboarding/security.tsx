import { router } from 'expo-router';
import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSettings } from '@/hooks/useSettings';

export default function SecurityScreen() {
  const { settings, saveSettings } = useSettings();
  const [appLockEnabled, setAppLockEnabled] = useState(settings?.appLockEnabled ?? false);
  const [biometricUnlockEnabled, setBiometricUnlockEnabled] = useState(settings?.biometricUnlockEnabled ?? false);
  const [hideFinancialValues, setHideFinancialValues] = useState(settings?.hideFinancialValues ?? false);

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Seguranca opcional" subtitle="PIN, biometria e ocultar valores." />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>PIN</AppCard.Title>
        <StatusBadge tone={appLockEnabled ? 'success' : 'info'} label={appLockEnabled ? 'Ativado' : 'Opcional'} />
        <AppButton
          label={appLockEnabled ? 'Desativar PIN' : 'Ativar PIN'}
          variant={appLockEnabled ? 'secondary' : 'primary'}
          onPress={() => setAppLockEnabled((value) => !value)}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Biometria</AppCard.Title>
        <StatusBadge tone={biometricUnlockEnabled ? 'success' : 'info'} label={biometricUnlockEnabled ? 'Ativada' : 'Opcional'} />
        <AppButton
          label={biometricUnlockEnabled ? 'Desativar biometria' : 'Ativar biometria'}
          variant={biometricUnlockEnabled ? 'secondary' : 'primary'}
          onPress={() => setBiometricUnlockEnabled((value) => !value)}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Valores financeiros</AppCard.Title>
        <StatusBadge tone={hideFinancialValues ? 'warning' : 'info'} label={hideFinancialValues ? 'Ocultos' : 'Visiveis'} />
        <AppButton
          label={hideFinancialValues ? 'Mostrar valores' : 'Ocultar valores'}
          variant={hideFinancialValues ? 'secondary' : 'primary'}
          onPress={() => setHideFinancialValues((value) => !value)}
        />
      </AppCard>

      <AppButton
        label="Concluir"
        onPress={async () => {
          await saveSettings({ appLockEnabled, biometricUnlockEnabled, hideFinancialValues, onboardingCompleted: true });
          router.replace('/onboarding/done');
        }}
      />
      <AppButton label="Voltar" variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}
