export const migration005UserName = {
  version: 5,
  name: 'user_name',
  statements: [
    `ALTER TABLE app_settings ADD COLUMN user_name TEXT;`,
  ],
} as const;
