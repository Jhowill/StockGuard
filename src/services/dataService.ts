import { getDatabase, withTransaction } from '@/database/db';
import { createAuditLog } from '@/database/repositories/auditLogRepository';
import { nowIso } from '@/utils/date';
import { clearSecuritySecrets } from '@/services/securityService';

export async function deleteAllUserData() {
  await withTransaction(async (db) => {
    await db.execAsync('DELETE FROM stock_movements;');
    await db.execAsync('DELETE FROM products;');
    await db.execAsync('DELETE FROM categories;');
    await db.execAsync('DELETE FROM suppliers;');
    await db.execAsync('DELETE FROM ad_entitlements;');
    await db.execAsync('DELETE FROM feature_usage_limits;');
    await db.execAsync('DELETE FROM backup_records;');
    await db.runAsync(
      `UPDATE app_settings SET
        onboarding_completed = 0,
        usage_type = 'other',
        hide_financial_values = 0,
        ads_enabled = 1,
        last_backup_at = NULL,
        updated_at = ?
       WHERE id = 'default'`,
      nowIso(),
    );
  });

  await clearSecuritySecrets();

  await createAuditLog({
    action: 'all_data_deleted',
    entityType: 'app',
    entityId: 'default',
    metadataJson: JSON.stringify({ source: 'settings' }),
  });
}

export async function countProductsByCategory(categoryId: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND status = "active"',
    categoryId,
  );
  return row?.total ?? 0;
}

export async function countProductsBySupplier(supplierId: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM products WHERE supplier_id = ? AND status = "active"',
    supplierId,
  );
  return row?.total ?? 0;
}
