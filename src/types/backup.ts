export type BackupRecord = {
  id: string;
  type: 'export' | 'import';
  format: 'json' | 'csv' | 'encrypted_json';
  fileName?: string;
  fileSizeBytes?: number;
  encrypted: boolean;
  status: 'success' | 'failed';
  errorMessage?: string;
  createdAt: string;
};
