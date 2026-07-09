import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useI18n } from '@/hooks/useI18n';
import { useAppState } from '@/state/app-state';

export default function SettingsScreen() {
  const { t } = useI18n();
  const { theme, setThemeMode, language, setLanguage, resetDemo } = useAppState();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.appearance')}</AppCard.Title>
        <StatusBadge tone="info" label={theme} />
        <AppButton label={t('settings.themeSystem')} variant="ghost" onPress={() => setThemeMode('system')} />
        <AppButton label={t('settings.themeLight')} variant="ghost" onPress={() => setThemeMode('light')} />
        <AppButton label={t('settings.themeDark')} variant="ghost" onPress={() => setThemeMode('dark')} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.language')}</AppCard.Title>
        <StatusBadge tone="info" label={language} />
        <AppButton label="PT-BR" variant="ghost" onPress={() => setLanguage('pt-BR')} />
        <AppButton label="EN" variant="ghost" onPress={() => setLanguage('en')} />
        <AppButton label="ES" variant="ghost" onPress={() => setLanguage('es')} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.data')}</AppCard.Title>
        <AppButton label={t('settings.restartDemo')} variant="secondary" onPress={resetDemo} />
      </AppCard>
    </ScreenContainer>
  );
}
