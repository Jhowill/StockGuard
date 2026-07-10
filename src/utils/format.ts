import type { CurrencyCode } from '@/state/app-state';

export function formatMoney(valueCents: number, currency: CurrencyCode, locale = 'pt-BR') {
  const value = valueCents / 100;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
