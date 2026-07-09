import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AppState } from 'react-native';
import { getSettings, updateSettings } from '@/database/repositories/settingsRepository';

export type ThemeMode = 'system' | 'light' | 'dark';
export type AppLanguage = 'system' | 'pt-BR' | 'en' | 'es';
export type CurrencyCode = 'BRL' | 'USD' | 'EUR';
export type UsageType = 'store' | 'workshop' | 'personal' | 'service' | 'other';

type AppStateValue = {
  hasCompletedOnboarding: boolean;
  isReady: boolean;
  theme: ThemeMode;
  language: AppLanguage;
  currency: CurrencyCode;
  usageType: UsageType;
  appLockEnabled: boolean;
  biometricUnlockEnabled: boolean;
  hideFinancialValues: boolean;
  isUnlocked: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  completeOnboarding: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setUsageType: (usageType: UsageType) => void;
  setHideFinancialValues: (enabled: boolean) => void;
  setAppLockEnabled: (enabled: boolean) => void;
  setBiometricUnlockEnabled: (enabled: boolean) => void;
  unlockApp: () => void;
  lockApp: () => void;
  resetDemo: () => Promise<void>;
  hydrateFromSettings: () => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [language, setLanguage] = useState<AppLanguage>('system');
  const [currency, setCurrency] = useState<CurrencyCode>('BRL');
  const [usageType, setUsageType] = useState<UsageType>('other');
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [biometricUnlockEnabled, setBiometricUnlockEnabled] = useState(false);
  const [hideFinancialValues, setHideFinancialValues] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const settings = await getSettings();
        setTheme(settings.theme);
        setLanguage(settings.language);
        setCurrency(settings.currency);
        setUsageType(settings.usageType);
        setAppLockEnabled(settings.appLockEnabled);
        setBiometricUnlockEnabled(settings.biometricUnlockEnabled);
        setHideFinancialValues(settings.hideFinancialValues);
        setHasCompletedOnboarding(settings.onboardingCompleted);
        setIsUnlocked(!settings.appLockEnabled);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active' && appLockEnabled) {
        setIsUnlocked(false);
      }
    });

    return () => subscription.remove();
  }, [appLockEnabled]);

  const value = useMemo<AppStateValue>(
    () => ({
      hasCompletedOnboarding,
      isReady,
      theme,
      language,
      currency,
      usageType,
      appLockEnabled,
      biometricUnlockEnabled,
      hideFinancialValues,
      isUnlocked,
      setOnboardingCompleted: setHasCompletedOnboarding,
      completeOnboarding: async () => {
        await updateSettings({ onboardingCompleted: true });
        setHasCompletedOnboarding(true);
      },
      setThemeMode: setTheme,
      setLanguage,
      setCurrency,
      setUsageType,
      setHideFinancialValues: (enabled: boolean) => {
        setHideFinancialValues(enabled);
      },
      setAppLockEnabled: (enabled: boolean) => {
        setAppLockEnabled(enabled);
        if (!enabled) {
          setIsUnlocked(true);
        }
      },
      setBiometricUnlockEnabled,
      unlockApp: () => setIsUnlocked(true),
      lockApp: () => setIsUnlocked(false),
      resetDemo: async () => {
        await updateSettings({
          onboardingCompleted: false,
          theme: 'system',
          language: 'system',
          currency: 'BRL',
          usageType: 'other',
          appLockEnabled: false,
          biometricUnlockEnabled: false,
          hideFinancialValues: false,
        });
        setHasCompletedOnboarding(false);
        setTheme('system');
        setLanguage('system');
        setCurrency('BRL');
        setUsageType('other');
        setHideFinancialValues(false);
        setAppLockEnabled(false);
        setBiometricUnlockEnabled(false);
        setIsUnlocked(true);
      },
      hydrateFromSettings: async () => {
        const settings = await getSettings();
        setTheme(settings.theme);
        setLanguage(settings.language);
        setCurrency(settings.currency);
        setUsageType(settings.usageType);
        setAppLockEnabled(settings.appLockEnabled);
        setBiometricUnlockEnabled(settings.biometricUnlockEnabled);
        setHideFinancialValues(settings.hideFinancialValues);
        setHasCompletedOnboarding(settings.onboardingCompleted);
        setIsUnlocked(!settings.appLockEnabled);
      },
    }),
    [
      appLockEnabled,
      biometricUnlockEnabled,
      currency,
      hasCompletedOnboarding,
      isReady,
      isUnlocked,
      hideFinancialValues,
      language,
      theme,
      usageType,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);

  if (!value) {
    throw new Error('useAppState must be used inside AppProvider');
  }

  return value;
}
