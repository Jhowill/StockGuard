export const supportedLanguages = ['system', 'pt-BR', 'en', 'es'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];
