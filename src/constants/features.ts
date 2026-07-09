import type { PremiumFeature } from '@/types/ads';

export const featureDurations: Record<PremiumFeature, { days?: number; uses?: number; freeLimit?: number }> = {
  advanced_pdf_reports: { days: 1 },
  csv_export: { uses: 3, freeLimit: 1 },
  barcode_scanner: { uses: 10, freeLimit: 5 },
  encrypted_backup: { uses: 1 },
  profit_analysis: { days: 1 },
  advanced_history: { days: 1 },
  unlimited_categories: { days: 1 },
  batch_expiration_control: { days: 1 },
};

export const premiumFeatures: PremiumFeature[] = [
  'advanced_pdf_reports',
  'csv_export',
  'barcode_scanner',
  'encrypted_backup',
  'profit_analysis',
  'advanced_history',
  'unlimited_categories',
  'batch_expiration_control',
];
