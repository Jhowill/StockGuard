import { getDatabase } from '../db';
import { createAuditLog } from './auditLogRepository';
import type { AppLanguage, CurrencyCode, ThemeMode, UsageType } from '@/types/settings';

export type AppSettingsRecord = {
  id: 'default';
  theme: ThemeMode;
  language: AppLanguage;
  currency: CurrencyCode;
  usageType: UsageType;
  onboardingCompleted: boolean;
  appLockEnabled: boolean;
  biometricUnlockEnabled: boolean;
  hideFinancialValues: boolean;
  adsEnabled: boolean;
  personalizedAdsConsent: 'unknown' | 'granted' | 'denied';
  expirationWarningDays: number;
  lowStockWarningEnabled: boolean;
  expirationWarningEnabled: boolean;
  backupReminderEnabled: boolean;
  lastBackupAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type SettingsRow = {
  id: string;
  theme: ThemeMode;
  language: AppLanguage;
  currency: CurrencyCode;
  usage_type: UsageType;
  onboarding_completed: number;
  app_lock_enabled: number;
  biometric_unlock_enabled: number;
  hide_financial_values: number;
  ads_enabled: number;
  personalized_ads_consent: 'unknown' | 'granted' | 'denied' | null;
  expiration_warning_days: number;
  low_stock_warning_enabled: number;
  expiration_warning_enabled: number;
  backup_reminder_enabled: number;
  last_backup_at: string | null;
  created_at: string;
  updated_at: string;
};

const DEFAULT_SETTINGS: AppSettingsRecord = {
  id: 'default',
  theme: 'system',
  language: 'system',
  currency: 'BRL',
  usageType: 'other',
  onboardingCompleted: false,
  appLockEnabled: false,
  biometricUnlockEnabled: false,
  hideFinancialValues: false,
  adsEnabled: true,
  personalizedAdsConsent: 'unknown',
  expirationWarningDays: 7,
  lowStockWarningEnabled: true,
  expirationWarningEnabled: true,
  backupReminderEnabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const themeModes: ThemeMode[] = ['system', 'light', 'dark'];
const languages: AppLanguage[] = ['system', 'pt-BR', 'en', 'es'];
const currencies: CurrencyCode[] = ['BRL', 'USD', 'EUR'];
const usageTypes: UsageType[] = ['store', 'workshop', 'personal', 'service', 'other'];
const consentValues: AppSettingsRecord['personalizedAdsConsent'][] = ['unknown', 'granted', 'denied'];

function pickAllowed<T extends string>(value: string | null | undefined, allowed: readonly T[], fallback: T) {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.trunc(value) : fallback;
}

function mapRow(row: SettingsRow): AppSettingsRecord {
  return {
    id: 'default',
    theme: pickAllowed(row.theme, themeModes, DEFAULT_SETTINGS.theme),
    language: pickAllowed(row.language, languages, DEFAULT_SETTINGS.language),
    currency: pickAllowed(row.currency, currencies, DEFAULT_SETTINGS.currency),
    usageType: pickAllowed(row.usage_type, usageTypes, DEFAULT_SETTINGS.usageType),
    onboardingCompleted: row.onboarding_completed === 1,
    appLockEnabled: row.app_lock_enabled === 1,
    biometricUnlockEnabled: row.biometric_unlock_enabled === 1,
    hideFinancialValues: row.hide_financial_values === 1,
    adsEnabled: row.ads_enabled === 1,
    personalizedAdsConsent: pickAllowed(row.personalized_ads_consent, consentValues, 'unknown'),
    expirationWarningDays: Number.isFinite(row.expiration_warning_days) && row.expiration_warning_days > 0 ? row.expiration_warning_days : DEFAULT_SETTINGS.expirationWarningDays,
    lowStockWarningEnabled: row.low_stock_warning_enabled === 1,
    expirationWarningEnabled: row.expiration_warning_enabled === 1,
    backupReminderEnabled: row.backup_reminder_enabled === 1,
    lastBackupAt: row.last_backup_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSettings() {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SettingsRow>('SELECT * FROM app_settings WHERE id = ?', 'default');
  return row ? mapRow(row) : ensureDefaultSettings();
}

export async function ensureDefaultSettings() {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<SettingsRow>('SELECT * FROM app_settings WHERE id = ?', 'default');

  if (existing) {
    return mapRow(existing);
  }

  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO app_settings (
      id, theme, language, currency, usage_type, onboarding_completed, app_lock_enabled, biometric_unlock_enabled,
      hide_financial_values, ads_enabled, personalized_ads_consent,
      expiration_warning_days, low_stock_warning_enabled, expiration_warning_enabled,
      backup_reminder_enabled, last_backup_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    DEFAULT_SETTINGS.id,
    DEFAULT_SETTINGS.theme,
    DEFAULT_SETTINGS.language,
    DEFAULT_SETTINGS.currency,
    DEFAULT_SETTINGS.usageType,
    0,
    0,
    0,
    0,
    1,
    'unknown',
    7,
    1,
    1,
    0,
    null,
    now,
    now,
  );

  return { ...DEFAULT_SETTINGS, createdAt: now, updatedAt: now };
}

export async function updateSettings(input: Partial<AppSettingsRecord>) {
  const current = await getSettings();
  const next: AppSettingsRecord = {
    ...current,
    ...input,
    theme: input.theme ? pickAllowed(input.theme, themeModes, current.theme) : current.theme,
    language: input.language ? pickAllowed(input.language, languages, current.language) : current.language,
    currency: input.currency ? pickAllowed(input.currency, currencies, current.currency) : current.currency,
    usageType: input.usageType ? pickAllowed(input.usageType, usageTypes, current.usageType) : current.usageType,
    personalizedAdsConsent: input.personalizedAdsConsent ? pickAllowed(input.personalizedAdsConsent, consentValues, current.personalizedAdsConsent) : current.personalizedAdsConsent,
    expirationWarningDays: normalizePositiveInteger(input.expirationWarningDays, current.expirationWarningDays),
    updatedAt: new Date().toISOString(),
  };

  const db = await getDatabase();
  await db.runAsync(
    `UPDATE app_settings SET
      theme = ?,
      language = ?,
      currency = ?,
      usage_type = ?,
      onboarding_completed = ?,
      app_lock_enabled = ?,
      biometric_unlock_enabled = ?,
      hide_financial_values = ?,
      ads_enabled = ?,
      personalized_ads_consent = ?,
      expiration_warning_days = ?,
      low_stock_warning_enabled = ?,
      expiration_warning_enabled = ?,
      backup_reminder_enabled = ?,
      last_backup_at = ?,
      updated_at = ?
     WHERE id = 'default'`,
    next.theme,
    next.language,
    next.currency,
    next.usageType,
    next.onboardingCompleted ? 1 : 0,
    next.appLockEnabled ? 1 : 0,
    next.biometricUnlockEnabled ? 1 : 0,
    next.hideFinancialValues ? 1 : 0,
    next.adsEnabled ? 1 : 0,
    next.personalizedAdsConsent,
    next.expirationWarningDays,
    next.lowStockWarningEnabled ? 1 : 0,
    next.expirationWarningEnabled ? 1 : 0,
    next.backupReminderEnabled ? 1 : 0,
    next.lastBackupAt ?? null,
    next.updatedAt,
  );

  await createAuditLog({
    action: 'settings_updated',
    entityType: 'settings',
    entityId: next.id,
    metadataJson: JSON.stringify(Object.keys(input)),
  });

  return next;
}

export async function markBackupAt(dateIso: string) {
  return updateSettings({ lastBackupAt: dateIso });
}
