export const migration004BackupFileUri = {
  version: 4,
  name: 'backup_file_uri',
  statements: [
    `ALTER TABLE backup_records ADD COLUMN file_uri TEXT;`,
  ],
} as const;
