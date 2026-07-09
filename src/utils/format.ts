import type { CurrencyCode } from '@/state/app-state';

export function formatMoney(valueCents: number, currency: CurrencyCode) {
  const value = valueCents / 100;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
