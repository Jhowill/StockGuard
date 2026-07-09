import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
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
  setOnboardingCompleted: (completed: boolean) => void;
  completeOnboarding: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setUsageType: (usageType: UsageType) => void;
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

  useEffect(() => {
    void (async () => {
      try {
        const settings = await getSettings();
        setTheme(settings.theme);
        setLanguage(settings.language);
        setCurrency(settings.currency);
        setUsageType(settings.usageType);
        setHasCompletedOnboarding(settings.onboardingCompleted);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      hasCompletedOnboarding,
      isReady,
      theme,
      language,
      currency,
      usageType,
      setOnboardingCompleted: setHasCompletedOnboarding,
      completeOnboarding: async () => {
        await updateSettings({ onboardingCompleted: true });
        setHasCompletedOnboarding(true);
      },
      setThemeMode: setTheme,
      setLanguage,
      setCurrency,
      setUsageType,
      resetDemo: async () => {
        await updateSettings({
          onboardingCompleted: false,
          theme: 'system',
          language: 'system',
          currency: 'BRL',
          usageType: 'other',
        });
        setHasCompletedOnboarding(false);
        setTheme('system');
        setLanguage('system');
        setCurrency('BRL');
        setUsageType('other');
      },
      hydrateFromSettings: async () => {
        const settings = await getSettings();
        setTheme(settings.theme);
        setLanguage(settings.language);
        setCurrency(settings.currency);
        setUsageType(settings.usageType);
        setHasCompletedOnboarding(settings.onboardingCompleted);
      },
    }),
    [currency, hasCompletedOnboarding, isReady, language, theme, usageType],
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
