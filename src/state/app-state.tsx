import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getSettings } from '@/database/repositories/settingsRepository';

export type ThemeMode = 'system' | 'light' | 'dark';
export type AppLanguage = 'system' | 'pt-BR' | 'en' | 'es';
export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

type AppStateValue = {
  hasCompletedOnboarding: boolean;
  theme: ThemeMode;
  language: AppLanguage;
  currency: CurrencyCode;
  completeOnboarding: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setCurrency: (currency: CurrencyCode) => void;
  resetDemo: () => void;
  hydrateFromSettings: () => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [language, setLanguage] = useState<AppLanguage>('system');
  const [currency, setCurrency] = useState<CurrencyCode>('BRL');

  useEffect(() => {
    void (async () => {
      const settings = await getSettings();
      setTheme(settings.theme);
      setLanguage(settings.language);
      setCurrency(settings.currency);
    })();
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      hasCompletedOnboarding,
      theme,
      language,
      currency,
      completeOnboarding: () => setHasCompletedOnboarding(true),
      setThemeMode: setTheme,
      setLanguage,
      setCurrency,
      resetDemo: () => {
        setHasCompletedOnboarding(false);
        setTheme('system');
        setLanguage('system');
        setCurrency('BRL');
      },
      hydrateFromSettings: async () => {
        const settings = await getSettings();
        setTheme(settings.theme);
        setLanguage(settings.language);
        setCurrency(settings.currency);
      },
    }),
    [currency, hasCompletedOnboarding, language, theme],
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
