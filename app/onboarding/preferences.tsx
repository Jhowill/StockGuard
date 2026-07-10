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
import { useI18n } from '@/hooks/useI18n';
import { useSettings } from '@/hooks/useSettings';
import type { AppLanguage, CurrencyCode, ThemeMode } from '@/state/app-state';

export default function PreferencesScreen() {
  const { settings, saveSettings } = useSettings();
  const { t } = useI18n();
  const { palette } = useAppTheme();
  const [theme, setTheme] = useState<ThemeMode>(settings?.theme ?? 'system');
  const [language, setLanguage] = useState<AppLanguage>(settings?.language ?? 'system');
  const [currency, setCurrency] = useState<CurrencyCode>(settings?.currency ?? 'BRL');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('onboardingPrefs.title')} subtitle={t('onboardingPrefs.subtitle')} variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="color-palette-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>{t('onboardingPrefs.heroTitle')}</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('onboardingPrefs.heroBody')}</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label={t('onboardingPrefs.step')} />
        </View>
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.theme')}</AppCard.Title>
        <AppCard.Text>{t('onboardingPrefs.themeBody')}</AppCard.Text>
        <AppSelect
          label={t('settings.theme')}
          value={theme}
          options={[
            { value: 'system', label: t('settings.themeSystem') },
            { value: 'light', label: t('settings.themeLight') },
            { value: 'dark', label: t('settings.themeDark') },
          ]}
          disabled={saving}
          onChange={setTheme}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.language')}</AppCard.Title>
        <AppCard.Text>{t('onboardingPrefs.languageBody')}</AppCard.Text>
        <AppSelect
          label={t('settings.language')}
          value={language}
          options={[
            { value: 'system', label: t('settings.themeSystem') },
            { value: 'pt-BR', label: 'PT-BR' },
            { value: 'en', label: 'EN' },
            { value: 'es', label: 'ES' },
          ]}
          disabled={saving}
          onChange={setLanguage}
        />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.currency')}</AppCard.Title>
        <AppCard.Text>{t('onboardingPrefs.currencyBody')}</AppCard.Text>
        <AppSelect
          label={t('settings.currency')}
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
        label={saving ? '...' : t('onboardingPrefs.next')}
        disabled={saving}
        onPress={async () => {
          if (saving) return;

          setSaving(true);
          setError(undefined);
          try {
            await saveSettings({ theme, language, currency });
            router.push('/onboarding/security');
          } catch {
            setError(t('onboardingPrefs.saveFailed'));
          } finally {
            setSaving(false);
          }
        }}
      />
      {error ? <AppCard><AppCard.Text>{error}</AppCard.Text></AppCard> : null}
      <AppButton label={t('common.back')} variant="ghost" onPress={() => router.back()} />
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
