export const migration003UsageType = {
  version: 3,
  name: 'usage_type',
  statements: [
    `ALTER TABLE app_settings ADD COLUMN usage_type TEXT NOT NULL DEFAULT 'other';`,
    `UPDATE app_settings SET usage_type = COALESCE(usage_type, 'other');`,
  ],
} as const;
