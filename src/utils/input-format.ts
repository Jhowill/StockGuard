type NumericParts = {
  integerDigits: string;
  fractionDigits: string;
  hasDecimalSeparator: boolean;
  decimalSeparator: ',' | '.';
};

function trimNumericDigits(value: string) {
  return value.replace(/[^\d.,-]/g, '').replace(/-/g, '');
}

function normalizeIntegerDigits(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  return digits.replace(/^0+(?=\d)/, '') || '0';
}

function splitNumericValue(value: string): NumericParts {
  const cleaned = trimNumericDigits(value);
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma === -1 && lastDot === -1) {
    return {
      integerDigits: normalizeIntegerDigits(cleaned),
      fractionDigits: '',
      hasDecimalSeparator: false,
      decimalSeparator: ',',
    };
  }

  let separatorIndex = -1;
  let separatorChar: ',' | '.' = ',';

  if (lastComma >= 0 && lastDot >= 0) {
    separatorIndex = Math.max(lastComma, lastDot);
    separatorChar = cleaned[separatorIndex] === '.' ? '.' : ',';
  } else if (lastComma >= 0) {
    separatorIndex = lastComma;
    separatorChar = ',';
  } else if (lastDot >= 0) {
    const digitsAfter = cleaned.length - lastDot - 1;
    if (digitsAfter > 0 && digitsAfter <= 2) {
      separatorIndex = lastDot;
      separatorChar = '.';
    }
  }

  if (separatorIndex === -1) {
    return {
      integerDigits: normalizeIntegerDigits(cleaned),
      fractionDigits: '',
      hasDecimalSeparator: false,
      decimalSeparator: separatorChar,
    };
  }

  return {
    integerDigits: normalizeIntegerDigits(cleaned.slice(0, separatorIndex)),
    fractionDigits: cleaned.slice(separatorIndex + 1).replace(/\D/g, ''),
    hasDecimalSeparator: true,
    decimalSeparator: separatorChar,
  };
}

function formatGroupedInteger(value: string) {
  const normalized = normalizeIntegerDigits(value);
  if (!normalized) {
    return '';
  }

  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatDecimalNumberInput(value: string, maxFractionDigits: number, useGrouping: boolean) {
  const parts = splitNumericValue(value);
  const fractionDigits = parts.fractionDigits.slice(0, maxFractionDigits);
  const integerDigits = parts.integerDigits || (parts.hasDecimalSeparator ? '0' : '');
  const formattedInteger = useGrouping ? formatGroupedInteger(integerDigits) : normalizeIntegerDigits(integerDigits);

  if (!parts.hasDecimalSeparator) {
    return formattedInteger;
  }

  const prefix = formattedInteger || '0';
  return `${prefix}${parts.decimalSeparator}${fractionDigits}`;
}

export function formatMoneyInput(value: string) {
  return formatDecimalNumberInput(value, 2, true);
}

export function formatDecimalInput(value: string, maxFractionDigits = 3) {
  return formatDecimalNumberInput(value, maxFractionDigits, false);
}

export function formatIsoDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function formatMoneyInputFromCents(value?: number | null) {
  if (value == null) {
    return '';
  }

  return formatMoneyInput((value / 100).toFixed(2));
}

export function normalizeGeneralNumber(value: string) {
  return value.trim().replace(/\s+/g, '').replace(',', '.');
}

export function normalizeMoneyNumber(value: string) {
  const parts = splitNumericValue(value);
  if (!parts.hasDecimalSeparator && !parts.integerDigits && !parts.fractionDigits) {
    return '';
  }

  if (!parts.hasDecimalSeparator) {
    return parts.integerDigits;
  }

  const integer = parts.integerDigits || '0';
  const fraction = parts.fractionDigits;
  return fraction.length > 0 ? `${integer}.${fraction}` : integer;
}
