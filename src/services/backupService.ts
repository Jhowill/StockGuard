import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import CryptoJS from 'crypto-js';
import { getDatabase, withTransaction } from '@/database/db';
import { listProducts } from '@/database/repositories/productRepository';
import { listCategories } from '@/database/repositories/categoryRepository';
import { listSuppliers } from '@/database/repositories/supplierRepository';
import { listMovements } from '@/database/repositories/stockMovementRepository';
import { getSettings, updateSettings } from '@/database/repositories/settingsRepository';
import { createBackupRecord } from '@/database/repositories/backupRecordRepository';
import { createAuditLog } from '@/database/repositories/auditLogRepository';
import { SCHEMA_VERSION } from '@/database/schema';
import { nowIso } from '@/utils/date';
import type { AppSettingsRecord } from '@/database/repositories/settingsRepository';
import type { ProductRecord } from '@/database/repositories/productRepository';
import type { Category } from '@/types/category';
import type { Supplier } from '@/types/supplier';
import type { StockMovementRecord } from '@/database/repositories/stockMovementRepository';
import type { AdEntitlement } from '@/types/ads';

export type BackupPayload = {
  app: 'EstoqueGuard Offline';
  schemaVersion: number;
  exportedAt: string;
  locale: AppSettingsRecord['language'];
  products: ProductRecord[];
  categories: Category[];
  suppliers: Supplier[];
  stockMovements: StockMovementRecord[];
  appSettings: AppSettingsRecord;
  adEntitlements: AdEntitlement[];
};

type EncryptedBackupEnvelope = {
  app: 'EstoqueGuard Offline';
  encrypted: true;
  format: 'encrypted_json';
  schemaVersion: number;
  exportedAt: string;
  payload: string;
};

function backupFolder() {
  const folder = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!folder) {
    throw new Error('BACKUP_FOLDER_UNAVAILABLE');
  }

  return folder;
}

async function ensureFolderExists(uri: string) {
  if (!uri) {
    return;
  }

  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
  }
}

export async function buildBackupPayload(): Promise<BackupPayload> {
  const [products, categories, suppliers, stockMovements, appSettings] = await Promise.all([
    listProducts(true),
    listCategories(true),
    listSuppliers(true),
    listMovements(1000),
    getSettings(),
  ]);

  const adEntitlements = await getDatabase().then(async (db) => {
    const rows = await db.getAllAsync<AdEntitlement>(
      'SELECT * FROM ad_entitlements ORDER BY created_at DESC',
    );
    return rows;
  });

  return {
    app: 'EstoqueGuard Offline',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowIso(),
    locale: appSettings.language,
    products,
    categories,
    suppliers,
    stockMovements,
    appSettings,
    adEntitlements,
  };
}

function assertBackupPayload(payload: Partial<BackupPayload>) {
  if (payload.app !== 'EstoqueGuard Offline') {
    throw new Error('INVALID_BACKUP_FILE');
  }

  if (!Array.isArray(payload.products) || !Array.isArray(payload.categories) || !Array.isArray(payload.suppliers) || !Array.isArray(payload.stockMovements)) {
    throw new Error('INVALID_BACKUP_SCHEMA');
  }
}

function encryptPayload(payload: BackupPayload, password: string): EncryptedBackupEnvelope {
  if (password.trim().length < 6) {
    throw new Error('BACKUP_PASSWORD_TOO_SHORT');
  }

  return {
    app: 'EstoqueGuard Offline',
    encrypted: true,
    format: 'encrypted_json',
    schemaVersion: payload.schemaVersion,
    exportedAt: payload.exportedAt,
    payload: CryptoJS.AES.encrypt(JSON.stringify(payload), password).toString(),
  };
}

function decryptPayload(envelope: EncryptedBackupEnvelope, password?: string) {
  if (!password?.trim()) {
    throw new Error('BACKUP_PASSWORD_REQUIRED');
  }

  const bytes = CryptoJS.AES.decrypt(envelope.payload, password);
  const raw = bytes.toString(CryptoJS.enc.Utf8);
  if (!raw) {
    throw new Error('BACKUP_PASSWORD_INVALID');
  }
  return JSON.parse(raw) as BackupPayload;
}

export async function exportBackupFile(password?: string) {
  const payload = await buildBackupPayload();
  const encrypted = Boolean(password?.trim());
  const output = encrypted ? encryptPayload(payload, password ?? '') : payload;
  const folder = backupFolder();
  const fileName = `estoqueguard-backup-${payload.exportedAt.replace(/[:.]/g, '-')}${encrypted ? '.encrypted' : ''}.json`;
  const fileUri = `${folder}${fileName}`;
  await ensureFolderExists(folder);
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(output, null, 2));

  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  const fileSize = (fileInfo as { size?: number }).size;
  const record = await createBackupRecord({
    type: 'export',
    format: encrypted ? 'encrypted_json' : 'json',
    fileName,
    fileUri,
    fileSizeBytes: fileInfo.exists && !fileInfo.isDirectory ? fileSize : undefined,
    encrypted,
    status: 'success',
    createdAt: nowIso(),
  });

  await updateSettings({ lastBackupAt: record.createdAt });
  await createAuditLog({
    action: 'backup_created',
    entityType: 'backup',
    entityId: record.id,
    metadataJson: JSON.stringify({ encrypted, fileName }),
  });
  return { fileUri, fileName, record, payload };
}

export async function restoreBackupFile(fileUri: string, password?: string) {
  const raw = await FileSystem.readAsStringAsync(fileUri);
  let parsed: Partial<BackupPayload>;

  try {
    parsed = JSON.parse(raw) as Partial<BackupPayload>;
  } catch {
    throw new Error('INVALID_BACKUP_FILE');
  }

  if ((parsed as Partial<EncryptedBackupEnvelope>).encrypted) {
    try {
      parsed = decryptPayload(parsed as EncryptedBackupEnvelope, password);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('INVALID_BACKUP_FILE');
    }
  }

  assertBackupPayload(parsed);
  await exportBackupFile();

  const fallbackSettings = await getSettings();
  const nextSettings = parsed.appSettings && typeof parsed.appSettings === 'object'
    ? { ...fallbackSettings, ...parsed.appSettings }
    : fallbackSettings;
  const categories = Array.isArray(parsed.categories) ? parsed.categories : [];
  const suppliers = Array.isArray(parsed.suppliers) ? parsed.suppliers : [];
  const products = Array.isArray(parsed.products) ? parsed.products : [];
  const stockMovements = Array.isArray(parsed.stockMovements) ? parsed.stockMovements : [];
  const adEntitlements = Array.isArray(parsed.adEntitlements) ? parsed.adEntitlements : [];

  await withTransaction(async (db) => {
    await db.execAsync('DELETE FROM stock_movements;');
    await db.execAsync('DELETE FROM products;');
    await db.execAsync('DELETE FROM categories;');
    await db.execAsync('DELETE FROM suppliers;');
    await db.execAsync('DELETE FROM ad_entitlements;');
    await db.execAsync('DELETE FROM feature_usage_limits;');
    await db.execAsync('DELETE FROM audit_logs;');
    await db.execAsync('DELETE FROM app_settings;');

    for (const category of categories) {
      await db.runAsync(
        `INSERT INTO categories (id, name, color_token, icon_name, sort_order, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        category.id,
        category.name,
        category.colorToken ?? null,
        category.iconName ?? null,
        category.sortOrder,
        category.status,
        category.createdAt,
        category.updatedAt,
      );
    }

    for (const supplier of suppliers) {
      await db.runAsync(
        `INSERT INTO suppliers (id, name, phone, email, document, address, notes, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        supplier.id,
        supplier.name,
        supplier.phone ?? null,
        supplier.email ?? null,
        supplier.document ?? null,
        supplier.address ?? null,
        supplier.notes ?? null,
        supplier.status,
        supplier.createdAt,
        supplier.updatedAt,
      );
    }

    for (const product of products) {
      await db.runAsync(
        `INSERT INTO products (
          id, name, description, sku, barcode, category_id, supplier_id, quantity,
          min_quantity, unit, cost_price_cents, sale_price_cents, currency,
          expiration_date, batch_code, location, image_uri, notes, status,
          created_at, updated_at, archived_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        product.id,
        product.name,
        product.description ?? null,
        product.sku ?? null,
        product.barcode ?? null,
        product.categoryId ?? null,
        product.supplierId ?? null,
        product.quantity,
        product.minQuantity,
        product.unit,
        product.costPriceCents ?? null,
        product.salePriceCents ?? null,
        product.currency,
        product.expirationDate ?? null,
        product.batchCode ?? null,
        product.location ?? null,
        product.imageUri ?? null,
        product.notes ?? null,
        product.status,
        product.createdAt,
        product.updatedAt,
        product.archivedAt ?? null,
      );
    }

    for (const movement of stockMovements) {
      await db.runAsync(
        `INSERT INTO stock_movements (
          id, product_id, type, reason, quantity, previous_quantity, new_quantity,
          unit_cost_cents, unit_sale_price_cents, total_cost_cents, total_sale_cents,
          currency, note, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        movement.id,
        movement.productId,
        movement.type,
        movement.reason,
        movement.quantity,
        movement.previousQuantity,
        movement.newQuantity,
        movement.unitCostCents ?? null,
        movement.unitSalePriceCents ?? null,
        movement.totalCostCents ?? null,
        movement.totalSaleCents ?? null,
        movement.currency,
        movement.note ?? null,
        movement.createdAt,
      );
    }

    for (const entitlement of adEntitlements) {
      await db.runAsync(
        `INSERT INTO ad_entitlements (
          id, type, source, feature_key, started_at, expires_at, remaining_uses,
          daily_use_date, daily_use_count, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        entitlement.id,
        entitlement.type,
        entitlement.source,
        entitlement.featureKey ?? null,
        entitlement.startedAt,
        entitlement.expiresAt ?? null,
        entitlement.remainingUses ?? null,
        entitlement.dailyUseDate,
        entitlement.dailyUseCount,
        entitlement.status,
        entitlement.createdAt,
        entitlement.updatedAt,
      );
    }

    await db.runAsync(
      `INSERT INTO app_settings (
        id, theme, language, currency, usage_type, onboarding_completed, app_lock_enabled, biometric_unlock_enabled,
        hide_financial_values, ads_enabled, personalized_ads_consent,
        expiration_warning_days, low_stock_warning_enabled, expiration_warning_enabled,
        backup_reminder_enabled, last_backup_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      nextSettings.id,
      nextSettings.theme,
      nextSettings.language,
      nextSettings.currency,
      nextSettings.usageType,
      nextSettings.onboardingCompleted ? 1 : 0,
      nextSettings.appLockEnabled ? 1 : 0,
      nextSettings.biometricUnlockEnabled ? 1 : 0,
      nextSettings.hideFinancialValues ? 1 : 0,
      nextSettings.adsEnabled ? 1 : 0,
      nextSettings.personalizedAdsConsent,
      nextSettings.expirationWarningDays,
      nextSettings.lowStockWarningEnabled ? 1 : 0,
      nextSettings.expirationWarningEnabled ? 1 : 0,
      nextSettings.backupReminderEnabled ? 1 : 0,
      nextSettings.lastBackupAt ?? null,
      nextSettings.createdAt,
      nextSettings.updatedAt,
    );
  });

  const record = await createBackupRecord({
    type: 'import',
    format: (raw.includes('"encrypted": true') ? 'encrypted_json' : 'json'),
    fileName: fileUri.split(/[/\\]/).pop(),
    fileUri,
    fileSizeBytes: ((await FileSystem.getInfoAsync(fileUri)) as { size?: number }).size,
    encrypted: raw.includes('"encrypted": true'),
    status: 'success',
    createdAt: nowIso(),
  });

  await createAuditLog({
    action: 'backup_restored',
    entityType: 'backup',
    entityId: record.id,
    metadataJson: JSON.stringify({ fileUri, encrypted: record.encrypted }),
  });

  return { record, payload: parsed as BackupPayload };
}

export async function shareBackupFile(fileUri: string) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('SHARING_UNAVAILABLE');
  }

  await Sharing.shareAsync(fileUri);
}
