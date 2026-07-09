export type ThemeMode = 'system' | 'light' | 'dark';
export type AppLanguage = 'system' | 'pt-BR' | 'en' | 'es';
export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

export type AppSettingsDraft = {
  theme: ThemeMode;
  language: AppLanguage;
  currency: CurrencyCode;
};
