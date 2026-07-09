export type AuditAction =
  | 'product_created'
  | 'product_updated'
  | 'product_archived'
  | 'stock_movement_created'
  | 'category_created'
  | 'category_updated'
  | 'supplier_created'
  | 'supplier_updated'
  | 'settings_updated'
  | 'backup_created'
  | 'backup_restored'
  | 'app_lock_enabled'
  | 'app_lock_disabled'
  | 'ad_reward_granted'
  | 'feature_unlocked_by_ad'
  | 'data_exported'
  | 'all_data_deleted';

export type AuditLog = {
  id: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadataJson?: string;
  createdAt: string;
};
