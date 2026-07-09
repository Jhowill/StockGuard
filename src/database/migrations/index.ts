import { migration001InitialSchema } from './001_initial_schema';
import { migration002OnboardingCompleted } from './002_onboarding_completed';

export const migrations = [migration001InitialSchema, migration002OnboardingCompleted] as const;
