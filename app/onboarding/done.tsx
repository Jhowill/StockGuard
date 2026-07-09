import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSettings } from '@/hooks/useSettings';

export default function OnboardingDoneScreen() {
  const { palette } = useAppTheme();
  const { saveSettings } = useSettings();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Pronto!" subtitle="Seu ambiente inicial esta configurado." />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="checkmark-circle-outline" size={34} color={palette.success} />
        </View>
        <Text style={[styles.heroTitle, { color: palette.text }]}>Seu ambiente inicial esta pronto.</Text>
        <Text style={[styles.heroBody, { color: palette.textMuted }]}>
          Voce ja pode cadastrar produtos, movimentar o estoque e consultar alertas offline.
        </Text>
      </AppCard>

      <AppButton
        label="Entrar no app"
        onPress={async () => {
          await saveSettings({ onboardingCompleted: true });
          router.replace('/(tabs)');
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    gap: 14,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
