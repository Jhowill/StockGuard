export const migration002OnboardingCompleted = {
  version: 2,
  name: 'onboarding_completed',
  statements: [
    `ALTER TABLE app_settings ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 0;`,
    `UPDATE app_settings SET onboarding_completed = COALESCE(onboarding_completed, 0);`,
  ],
} as const;
