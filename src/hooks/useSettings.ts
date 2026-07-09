import { useCallback, useEffect, useState } from 'react';
import { getSettings, updateSettings } from '@/database/repositories/settingsRepository';
import type { AppSettingsRecord } from '@/database/repositories/settingsRepository';
import { useAppState } from '@/state/app-state';

export function useSettings() {
  const {
    setThemeMode,
    setLanguage,
    setCurrency,
    setUsageType,
    setOnboardingCompleted,
    setHideFinancialValues,
    setAppLockEnabled,
    setBiometricUnlockEnabled,
    unlockApp,
  } = useAppState();
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
      setHideFinancialValues(result.hideFinancialValues);
      setAppLockEnabled(result.appLockEnabled);
      setBiometricUnlockEnabled(result.biometricUnlockEnabled);
      if (!result.appLockEnabled) {
        unlockApp();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SETTINGS_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, [setCurrency, setHideFinancialValues, setLanguage, setOnboardingCompleted, setThemeMode, setUsageType, setAppLockEnabled, setBiometricUnlockEnabled, unlockApp]);

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
      setHideFinancialValues(next.hideFinancialValues);
      setAppLockEnabled(next.appLockEnabled);
      setBiometricUnlockEnabled(next.biometricUnlockEnabled);
      if (!next.appLockEnabled) {
        unlockApp();
      }
      return next;
    },
    [
      setAppLockEnabled,
      setBiometricUnlockEnabled,
      setCurrency,
      setHideFinancialValues,
      setLanguage,
      setOnboardingCompleted,
      setThemeMode,
      setUsageType,
      unlockApp,
    ],
  );

  return {
    settings,
    loading,
    error,
    refresh,
    saveSettings,
  };
}
