import { useCallback, useEffect, useState } from 'react';
import { getSettings, updateSettings } from '@/database/repositories/settingsRepository';
import type { AppSettingsRecord } from '@/database/repositories/settingsRepository';
import { useAppState } from '@/state/app-state';

export function useSettings() {
  const { setThemeMode, setLanguage, setCurrency, setUsageType, setOnboardingCompleted } = useAppState();
  const [settings, setSettings] = useState<AppSettingsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await getSettings();
      setSettings(result);
      setThemeMode(result.theme);
      setLanguage(result.language);
      setCurrency(result.currency);
      setUsageType(result.usageType);
      setOnboardingCompleted(result.onboardingCompleted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SETTINGS_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, [setCurrency, setLanguage, setThemeMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveSettings = useCallback(
    async (input: Partial<AppSettingsRecord>) => {
      const next = await updateSettings(input);
      setSettings(next);
      setThemeMode(next.theme);
      setLanguage(next.language);
      setCurrency(next.currency);
      setUsageType(next.usageType);
      setOnboardingCompleted(next.onboardingCompleted);
      return next;
    },
    [setCurrency, setLanguage, setOnboardingCompleted, setThemeMode, setUsageType],
  );

  return {
    settings,
    loading,
    error,
    refresh,
    saveSettings,
  };
}
