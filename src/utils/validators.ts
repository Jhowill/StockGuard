export function isNonEmptyString(value: string | undefined | null) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function parseFiniteNumber(value: string, fallback = 0) {
  const normalized = value.trim().replace(',', '.');
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
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 100);
}
