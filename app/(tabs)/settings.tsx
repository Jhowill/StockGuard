import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSettings } from '@/hooks/useSettings';
import { useI18n } from '@/hooks/useI18n';

export default function SettingsScreen() {
  const { t } = useI18n();
  const { settings, loading, error, saveSettings } = useSettings();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      {loading ? (
        <EmptyState title={t('settings.data')} description={t('settings.subtitle')} />
      ) : error ? (
        <EmptyState title={t('settings.data')} description={error} />
      ) : null}

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.appearance')}</AppCard.Title>
        <StatusBadge tone="info" label={settings?.theme ?? '...'} />
        <AppButton label={t('settings.themeSystem')} variant="ghost" onPress={() => void saveSettings({ theme: 'system' })} />
        <AppButton label={t('settings.themeLight')} variant="ghost" onPress={() => void saveSettings({ theme: 'light' })} />
        <AppButton label={t('settings.themeDark')} variant="ghost" onPress={() => void saveSettings({ theme: 'dark' })} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.language')}</AppCard.Title>
        <StatusBadge tone="info" label={settings?.language ?? '...'} />
        <AppButton label="PT-BR" variant="ghost" onPress={() => void saveSettings({ language: 'pt-BR' })} />
        <AppButton label="EN" variant="ghost" onPress={() => void saveSettings({ language: 'en' })} />
        <AppButton label="ES" variant="ghost" onPress={() => void saveSettings({ language: 'es' })} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>{t('settings.data')}</AppCard.Title>
        <StatusBadge tone="success" label={settings?.currency ?? 'BRL'} />
        <AppButton
          label={t('settings.restartDemo')}
          variant="secondary"
          onPress={() => void saveSettings({ onboardingCompleted: false, theme: 'system', language: 'system', currency: 'BRL' })}
        />
      </AppCard>
    </ScreenContainer>
  );
}
