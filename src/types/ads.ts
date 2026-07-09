export type AdEntitlementType =
  | 'temporary_ad_free'
  | 'temporary_feature_unlock'
  | 'usage_feature_unlock';

export type AdSource = 'rewarded_ad' | 'rewarded_interstitial';

export type PremiumFeature =
  | 'advanced_pdf_reports'
  | 'csv_export'
  | 'barcode_scanner'
  | 'encrypted_backup'
  | 'profit_analysis'
  | 'advanced_history'
  | 'unlimited_categories'
  | 'batch_expiration_control';

export type AdEntitlement = {
  id: string;
  type: AdEntitlementType;
  source: AdSource;
  featureKey?: PremiumFeature;
  startedAt: string;
  expiresAt?: string;
  remainingUses?: number;
  dailyUseDate: string;
  dailyUseCount: number;
  status: 'active' | 'expired' | 'consumed' | 'revoked';
  createdAt: string;
  updatedAt: string;
};
