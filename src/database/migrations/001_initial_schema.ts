import { schemaStatements } from '../schema';

export const migration001InitialSchema = {
  version: 1,
  name: 'initial_schema',
  statements: schemaStatements,
} as const;
