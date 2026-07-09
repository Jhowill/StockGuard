import { migration001InitialSchema } from './001_initial_schema';

export const migrations = [migration001InitialSchema] as const;
