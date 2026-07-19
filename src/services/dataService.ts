import * as FileSystem from 'expo-file-system/legacy';
import { getDatabase, withExclusiveTransaction } from '@/database/db';
import { clearSecuritySecrets } from '@/services/securityService';

export async function deleteAllUserData() {
  await withExclusiveTransaction(async (db) => {
    await db.execAsync('DELETE FROM stock_movements;');
    await db.execAsync('DELETE FROM products;');
    await db.execAsync('DELETE FROM categories;');
    await db.execAsync('DELETE FROM suppliers;');
    await db.execAsync('DELETE FROM ad_entitlements;');
    await db.execAsync('DELETE FROM feature_usage_limits;');
    await db.execAsync('DELETE FROM audit_logs;');
    await db.execAsync('DELETE FROM backup_records;');
    await db.execAsync('DELETE FROM app_settings;');
  });

  const folder = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (folder) {
    try {
      const entries = await FileSystem.readDirectoryAsync(folder);
      await Promise.all(entries
        .filter((name) => name === 'product-images' || name.startsWith('estoqueguard-backup-') || name.startsWith('estoqueguard-relatorio-'))
        .map((name) => FileSystem.deleteAsync(`${folder}${name}`, { idempotent: true })));
    } catch {
      // Database deletion remains authoritative if filesystem cleanup is unavailable.
    }
  }

  await clearSecuritySecrets();
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
