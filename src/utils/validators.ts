export function isNonEmptyString(value: string | undefined | null) {
  return typeof value === 'string' && value.trim().length > 0;
}
