import { normalizeGeneralNumber, normalizeMoneyNumber } from '@/utils/input-format';

export const INPUT_LIMITS = {
  name: 120,
  shortText: 160,
  description: 1000,
  notes: 2000,
  identifier: 128,
  uri: 2048,
} as const;

export const MAX_STOCK_QUANTITY = 1_000_000_000_000;
export const MAX_MONEY_CENTS = Number.MAX_SAFE_INTEGER;

export function isNonEmptyString(value: string | undefined | null) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function assertTextLength(value: string | null | undefined, maxLength: number, code: string) {
  if (value != null && value.trim().length > maxLength) {
    throw new Error(code);
  }
}

export function parseFiniteNumber(value: string, fallback = 0) {
  const normalized = normalizeGeneralNumber(value);
  if (!normalized) {
    return fallback;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseNonNegativeNumber(value: string, fallback = 0) {
  return Math.max(0, parseFiniteNumber(value, fallback));
}

export function parsePositiveNumber(value: string, fallback = 0) {
  const parsed = parseFiniteNumber(value, fallback);
  return parsed > 0 ? parsed : fallback;
}

export function parseNonNegativeInteger(value: string, fallback = 0) {
  return Math.max(0, Math.round(parseFiniteNumber(value, fallback)));
}

export function parseMoneyToCents(value: string) {
  const normalized = normalizeMoneyNumber(value);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  const cents = Math.round(parsed * 100);
  return Number.isSafeInteger(cents) && cents <= MAX_MONEY_CENTS ? cents : null;
}

export function isValidStockQuantity(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_STOCK_QUANTITY;
}

export function isValidMoneyCents(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= MAX_MONEY_CENTS;
}

export function isValidIsoDate(value: string | undefined | null) {
  if (!value) {
    return true;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}
