import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppState } from '@/state/app-state';
import { useSettings } from '@/hooks/useSettings';

export default function SecurityScreen() {
  const { saveSettings } = useSettings();
  const { palette } = useAppTheme();
  const { appLockEnabled, biometricUnlockEnabled, hideFinancialValues } = useAppState();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const safeSave = async (input: Parameters<typeof saveSettings>[0]) => {
    if (saving) {
      return false;
    }

    setSaving(true);
    setError(undefined);
    try {
      await saveSettings(input);
      return true;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Nao foi possivel salvar a seguranca.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Seguranca opcional" subtitle="PIN, biometria e ocultar valores." variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="shield-checkmark-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Proteja o acesso desde o primeiro momento</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>Ative PIN, biometria e ocultacao de valores sem mudar o fluxo do app.</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label="Etapa 3 de 4" />
        </View>
      </AppCard>

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
        <AppButton label={hideFinancialValues ? 'Mostrar valores' : 'Ocultar valores'} disabled={saving} variant={hideFinancialValues ? 'secondary' : 'primary'} onPress={() => void safeSave({ hideFinancialValues: !hideFinancialValues })} />
      </AppCard>

      {error ? <EmptyState title="Seguranca" description={error} /> : null}

      <AppButton
        label={saving ? '...' : 'Concluir'}
        disabled={saving}
        onPress={async () => {
          const saved = await safeSave({ hideFinancialValues, onboardingCompleted: true });
          if (saved) {
            router.replace('/onboarding/done');
          }
        }}
      />
      <AppButton label="Voltar" variant="ghost" onPress={() => router.back()} />
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
