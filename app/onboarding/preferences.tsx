import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppSelect } from '@/components/ui/AppSelect';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSettings } from '@/hooks/useSettings';
import type { AppLanguage, CurrencyCode, ThemeMode } from '@/state/app-state';

export default function PreferencesScreen() {
  const { settings, saveSettings } = useSettings();
  const { palette } = useAppTheme();
  const [theme, setTheme] = useState<ThemeMode>(settings?.theme ?? 'system');
  const [language, setLanguage] = useState<AppLanguage>(settings?.language ?? 'system');
  const [currency, setCurrency] = useState<CurrencyCode>(settings?.currency ?? 'BRL');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Preferencias iniciais" subtitle="Ajuste idioma, tema e moeda." variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="color-palette-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Deixe o app com o seu jeito desde o inicio</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>Essas escolhas afinam a interface e os valores exibidos nas proximas telas.</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label="Etapa 2 de 4" />
        </View>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Tema</AppCard.Title>
        <AppCard.Text>Escolha o visual que fica mais confortavel para trabalhar.</AppCard.Text>
        <AppSelect
          label="Tema"
          value={theme}
          options={[
            { value: 'system', label: 'Sistema' },
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Escuro' },
          ]}
          disabled={saving}
          onChange={setTheme}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Idioma</AppCard.Title>
        <AppCard.Text>Use o idioma que deixa os atalhos e mensagens mais claros.</AppCard.Text>
        <AppSelect
          label="Idioma"
          value={language}
          options={[
            { value: 'system', label: 'Sistema' },
            { value: 'pt-BR', label: 'PT-BR' },
            { value: 'en', label: 'EN' },
            { value: 'es', label: 'ES' },
          ]}
          disabled={saving}
          onChange={setLanguage}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Moeda</AppCard.Title>
        <AppCard.Text>Ela sera usada em produtos, relatorios e backups.</AppCard.Text>
        <AppSelect
          label="Moeda"
          value={currency}
          options={[
            { value: 'BRL', label: 'BRL' },
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
          ]}
          disabled={saving}
          onChange={setCurrency}
        />
      </AppCard>

      <AppButton
        label={saving ? '...' : 'Proximo'}
        disabled={saving}
        onPress={async () => {
          if (saving) return;

          setSaving(true);
          setError(undefined);
          try {
            await saveSettings({ theme, language, currency });
            router.push('/onboarding/security');
          } catch {
            setError('Nao foi possivel salvar as preferencias.');
          } finally {
            setSaving(false);
          }
        }}
      />
      {error ? <AppCard><AppCard.Text>{error}</AppCard.Text></AppCard> : null}
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
