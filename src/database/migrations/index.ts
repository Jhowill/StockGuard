import { migration001InitialSchema } from './001_initial_schema';
import { migration002OnboardingCompleted } from './002_onboarding_completed';
import { migration003UsageType } from './003_usage_type';
import { migration004BackupFileUri } from './004_backup_file_uri';

export const migrations = [
  migration001InitialSchema,
  migration002OnboardingCompleted,
  migration003UsageType,
  migration004BackupFileUri,
] as const;
