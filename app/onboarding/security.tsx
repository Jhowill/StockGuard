import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppState } from '@/state/app-state';
import { useSettings } from '@/hooks/useSettings';

export default function SecurityScreen() {
  const { saveSettings } = useSettings();
  const { appLockEnabled, biometricUnlockEnabled, hideFinancialValues } = useAppState();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Seguranca opcional" subtitle="PIN, biometria e ocultar valores." />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>PIN</AppCard.Title>
        <StatusBadge tone={appLockEnabled ? 'success' : 'info'} label={appLockEnabled ? 'Ativado' : 'Opcional'} />
        <AppButton label={appLockEnabled ? 'Gerenciar PIN' : 'Ativar PIN'} variant={appLockEnabled ? 'secondary' : 'primary'} onPress={() => router.push('/security/pin')} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Biometria</AppCard.Title>
        <StatusBadge tone={biometricUnlockEnabled ? 'success' : 'info'} label={biometricUnlockEnabled ? 'Ativada' : 'Opcional'} />
        <AppButton label={biometricUnlockEnabled ? 'Gerenciar biometria' : 'Ativar biometria'} variant={biometricUnlockEnabled ? 'secondary' : 'primary'} onPress={() => router.push('/security/biometric')} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Valores financeiros</AppCard.Title>
        <StatusBadge tone={hideFinancialValues ? 'warning' : 'info'} label={hideFinancialValues ? 'Ocultos' : 'Visiveis'} />
        <AppButton label={hideFinancialValues ? 'Mostrar valores' : 'Ocultar valores'} variant={hideFinancialValues ? 'secondary' : 'primary'} onPress={() => void saveSettings({ hideFinancialValues: !hideFinancialValues })} />
      </AppCard>

      <AppButton
        label="Concluir"
        onPress={async () => {
          await saveSettings({ hideFinancialValues, onboardingCompleted: true });
          router.replace('/onboarding/done');
        }}
      />
      <AppButton label="Voltar" variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}
