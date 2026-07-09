import { router } from 'expo-router';
import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSettings } from '@/hooks/useSettings';
import type { AppLanguage, CurrencyCode, ThemeMode } from '@/state/app-state';

export default function PreferencesScreen() {
  const { settings, saveSettings } = useSettings();
  const [theme, setTheme] = useState<ThemeMode>(settings?.theme ?? 'system');
  const [language, setLanguage] = useState<AppLanguage>(settings?.language ?? 'system');
  const [currency, setCurrency] = useState<CurrencyCode>(settings?.currency ?? 'BRL');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Preferencias iniciais" subtitle="Ajuste idioma, tema e moeda." />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Tema</AppCard.Title>
        <StatusBadge tone="info" label={theme} />
        {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
          <AppButton
            key={mode}
            label={mode === 'system' ? 'Sistema' : mode === 'light' ? 'Claro' : 'Escuro'}
            variant={theme === mode ? 'primary' : 'ghost'}
            onPress={() => setTheme(mode)}
          />
        ))}
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Idioma</AppCard.Title>
        <StatusBadge tone="info" label={language} />
        {(['system', 'pt-BR', 'en', 'es'] as AppLanguage[]).map((value) => (
          <AppButton
            key={value}
            label={value === 'system' ? 'Sistema' : value === 'pt-BR' ? 'PT-BR' : value.toUpperCase()}
            variant={language === value ? 'primary' : 'ghost'}
            onPress={() => setLanguage(value)}
          />
        ))}
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Moeda</AppCard.Title>
        <StatusBadge tone="info" label={currency} />
        {(['BRL', 'USD', 'EUR'] as CurrencyCode[]).map((value) => (
          <AppButton
            key={value}
            label={value}
            variant={currency === value ? 'primary' : 'ghost'}
            onPress={() => setCurrency(value)}
          />
        ))}
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
