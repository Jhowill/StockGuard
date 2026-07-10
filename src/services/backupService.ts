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
import type { AdEntitlement, AdEntitlementType, AdSource, PremiumFeature } from '@/types/ads';
import type { CurrencyCode, AppLanguage, ThemeMode, UsageType } from '@/types/settings';
import type { ProductUnit } from '@/types/product';
import type { StockMovementType } from '@/types/stock';

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

const statusValues = ['active', 'archived'] as const;
const productUnits: ProductUnit[] = ['unit', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'box', 'pack', 'pair', 'service_item'];
const movementTypes: StockMovementType[] = ['in', 'out', 'loss', 'return', 'adjustment_positive', 'adjustment_negative', 'initial_balance'];
const themeModes: ThemeMode[] = ['system', 'light', 'dark'];
const languages: AppLanguage[] = ['system', 'pt-BR', 'en', 'es'];
const currencies: CurrencyCode[] = ['BRL', 'USD', 'EUR'];
const usageTypes: UsageType[] = ['store', 'workshop', 'personal', 'service', 'other'];
const consentValues: AppSettingsRecord['personalizedAdsConsent'][] = ['unknown', 'granted', 'denied'];
const entitlementTypes: AdEntitlementType[] = ['temporary_ad_free', 'temporary_feature_unlock', 'usage_feature_unlock'];
const entitlementSources: AdSource[] = ['rewarded_ad', 'rewarded_interstitial'];
const entitlementStatuses: AdEntitlement['status'][] = ['active', 'expired', 'consumed', 'revoked'];
const premiumFeatures: PremiumFeature[] = [
  'advanced_pdf_reports',
  'csv_export',
  'barcode_scanner',
  'encrypted_backup',
  'profit_analysis',
  'advanced_history',
  'unlimited_categories',
  'batch_expiration_control',
];

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
    listMovements(0),
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

  if (payload.schemaVersion !== SCHEMA_VERSION && payload.schemaVersion !== 4) {
    throw new Error('INCOMPATIBLE_BACKUP_SCHEMA');
  }

  if (!Array.isArray(payload.products) || !Array.isArray(payload.categories) || !Array.isArray(payload.suppliers) || !Array.isArray(payload.stockMovements)) {
    throw new Error('INVALID_BACKUP_SCHEMA');
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function pickAllowed<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback;
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeNonNegativeNumber(value: unknown, fallback = 0): number {
  return isFiniteNonNegativeNumber(value) ? value : fallback;
}

function normalizeOptionalNonNegativeNumber(value: unknown): number | undefined {
  return isFiniteNonNegativeNumber(value) ? value : undefined;
}

function normalizeIsoString(value: unknown, fallback = nowIso()): string {
  return isNonEmptyString(value) ? value.trim() : fallback;
}

function assertBackupRecords(payload: Partial<BackupPayload>) {
  const categories = payload.categories ?? [];
  const suppliers = payload.suppliers ?? [];
  const products = payload.products ?? [];
  const movements = payload.stockMovements ?? [];

  for (const category of categories) {
    if (!isNonEmptyString(category.id) || !isNonEmptyString(category.name) || !isFiniteNonNegativeNumber(category.sortOrder)) {
      throw new Error('INVALID_BACKUP_CATEGORY');
    }
  }

  for (const supplier of suppliers) {
    if (!isNonEmptyString(supplier.id) || !isNonEmptyString(supplier.name)) {
      throw new Error('INVALID_BACKUP_SUPPLIER');
    }
  }

  for (const product of products) {
    if (
      !isNonEmptyString(product.id)
      || !isNonEmptyString(product.name)
      || !isFiniteNonNegativeNumber(product.quantity)
      || !isFiniteNonNegativeNumber(product.minQuantity)
      || !productUnits.includes(product.unit)
      || !currencies.includes(product.currency)
    ) {
      throw new Error('INVALID_BACKUP_PRODUCT');
    }
  }

  const productIds = new Set(products.map((product) => product.id));
  for (const movement of movements) {
    if (
      !isNonEmptyString(movement.id)
      || !isNonEmptyString(movement.productId)
      || !productIds.has(movement.productId)
      || !movementTypes.includes(movement.type)
      || !isFiniteNonNegativeNumber(movement.quantity)
      || !isFiniteNonNegativeNumber(movement.previousQuantity)
      || !isFiniteNonNegativeNumber(movement.newQuantity)
      || !currencies.includes(movement.currency)
    ) {
      throw new Error('INVALID_BACKUP_MOVEMENT');
    }
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

  try {
    return JSON.parse(raw) as BackupPayload;
  } catch {
    throw new Error('INVALID_BACKUP_FILE');
  }
}

function normalizeRestoreCategories(categories: Category[]) {
  return categories.map((category) => ({
    ...category,
    id: category.id.trim(),
    name: category.name.trim(),
    colorToken: isNonEmptyString(category.colorToken) ? category.colorToken.trim() : undefined,
    iconName: isNonEmptyString(category.iconName) ? category.iconName.trim() : undefined,
    sortOrder: Math.trunc(normalizeNonNegativeNumber(category.sortOrder)),
    status: pickAllowed(category.status, statusValues, 'active'),
    createdAt: normalizeIsoString(category.createdAt),
    updatedAt: normalizeIsoString(category.updatedAt),
  }));
}

function normalizeRestoreSuppliers(suppliers: Supplier[]) {
  return suppliers.map((supplier) => ({
    ...supplier,
    id: supplier.id.trim(),
    name: supplier.name.trim(),
    phone: isNonEmptyString(supplier.phone) ? supplier.phone.trim() : undefined,
    email: isNonEmptyString(supplier.email) ? supplier.email.trim() : undefined,
    document: isNonEmptyString(supplier.document) ? supplier.document.trim() : undefined,
    address: isNonEmptyString(supplier.address) ? supplier.address.trim() : undefined,
    notes: isNonEmptyString(supplier.notes) ? supplier.notes.trim() : undefined,
    status: pickAllowed(supplier.status, statusValues, 'active'),
    createdAt: normalizeIsoString(supplier.createdAt),
    updatedAt: normalizeIsoString(supplier.updatedAt),
  }));
}

function normalizeRestoreProducts(products: ProductRecord[], categoryIds: Set<string>, supplierIds: Set<string>) {
  return products.map((product) => ({
    ...product,
    id: product.id.trim(),
    name: product.name.trim(),
    description: isNonEmptyString(product.description) ? product.description.trim() : undefined,
    sku: isNonEmptyString(product.sku) ? product.sku.trim() : undefined,
    barcode: isNonEmptyString(product.barcode) ? product.barcode.trim() : undefined,
    categoryId: product.categoryId && categoryIds.has(product.categoryId) ? product.categoryId : null,
    supplierId: product.supplierId && supplierIds.has(product.supplierId) ? product.supplierId : null,
    quantity: normalizeNonNegativeNumber(product.quantity),
    minQuantity: normalizeNonNegativeNumber(product.minQuantity),
    unit: pickAllowed(product.unit, productUnits, 'unit'),
    costPriceCents: normalizeOptionalNonNegativeNumber(product.costPriceCents),
    salePriceCents: normalizeOptionalNonNegativeNumber(product.salePriceCents),
    currency: pickAllowed(product.currency, currencies, 'BRL'),
    expirationDate: isNonEmptyString(product.expirationDate) ? product.expirationDate.trim() : undefined,
    batchCode: isNonEmptyString(product.batchCode) ? product.batchCode.trim() : undefined,
    location: isNonEmptyString(product.location) ? product.location.trim() : undefined,
    imageUri: isNonEmptyString(product.imageUri) ? product.imageUri.trim() : undefined,
    notes: isNonEmptyString(product.notes) ? product.notes.trim() : undefined,
    status: pickAllowed(product.status, statusValues, 'active'),
    createdAt: normalizeIsoString(product.createdAt),
    updatedAt: normalizeIsoString(product.updatedAt),
    archivedAt: isNonEmptyString(product.archivedAt) ? product.archivedAt.trim() : undefined,
  }));
}

function normalizeRestoreMovements(movements: StockMovementRecord[], productIds: Set<string>) {
  return movements
    .filter((movement) => productIds.has(movement.productId))
    .map((movement) => ({
      ...movement,
      id: movement.id.trim(),
      productId: movement.productId.trim(),
      type: pickAllowed(movement.type, movementTypes, 'in'),
      reason: isNonEmptyString(movement.reason) ? movement.reason.trim() : 'restore',
      quantity: normalizeNonNegativeNumber(movement.quantity),
      previousQuantity: normalizeNonNegativeNumber(movement.previousQuantity),
      newQuantity: normalizeNonNegativeNumber(movement.newQuantity),
      unitCostCents: normalizeOptionalNonNegativeNumber(movement.unitCostCents),
      unitSalePriceCents: normalizeOptionalNonNegativeNumber(movement.unitSalePriceCents),
      totalCostCents: normalizeOptionalNonNegativeNumber(movement.totalCostCents),
      totalSaleCents: normalizeOptionalNonNegativeNumber(movement.totalSaleCents),
      currency: pickAllowed(movement.currency, currencies, 'BRL'),
      note: isNonEmptyString(movement.note) ? movement.note.trim() : undefined,
      createdAt: normalizeIsoString(movement.createdAt),
    }));
}

function normalizeRestoredSettings(settings: AppSettingsRecord, fallback: AppSettingsRecord): AppSettingsRecord {
  return {
    ...fallback,
    ...settings,
    id: 'default',
    userName: isNonEmptyString(settings.userName) ? settings.userName.trim() : null,
    theme: pickAllowed(settings.theme, themeModes, fallback.theme),
    language: pickAllowed(settings.language, languages, fallback.language),
    currency: pickAllowed(settings.currency, currencies, fallback.currency),
    usageType: pickAllowed(settings.usageType, usageTypes, fallback.usageType),
    onboardingCompleted: normalizeBoolean(settings.onboardingCompleted, fallback.onboardingCompleted),
    appLockEnabled: normalizeBoolean(settings.appLockEnabled, fallback.appLockEnabled),
    biometricUnlockEnabled: normalizeBoolean(settings.biometricUnlockEnabled, false),
    hideFinancialValues: normalizeBoolean(settings.hideFinancialValues, fallback.hideFinancialValues),
    adsEnabled: normalizeBoolean(settings.adsEnabled, fallback.adsEnabled),
    personalizedAdsConsent: pickAllowed(settings.personalizedAdsConsent, consentValues, 'unknown'),
    expirationWarningDays: Math.max(1, Math.trunc(normalizeNonNegativeNumber(settings.expirationWarningDays, fallback.expirationWarningDays))),
    lowStockWarningEnabled: normalizeBoolean(settings.lowStockWarningEnabled, fallback.lowStockWarningEnabled),
    expirationWarningEnabled: normalizeBoolean(settings.expirationWarningEnabled, fallback.expirationWarningEnabled),
    backupReminderEnabled: normalizeBoolean(settings.backupReminderEnabled, fallback.backupReminderEnabled),
    lastBackupAt: isNonEmptyString(settings.lastBackupAt) ? settings.lastBackupAt.trim() : null,
    createdAt: isNonEmptyString(settings.createdAt) ? settings.createdAt : fallback.createdAt,
    updatedAt: nowIso(),
  };
}

function normalizeRestoreEntitlements(entitlements: AdEntitlement[]) {
  return entitlements
    .filter((entitlement) => isNonEmptyString(entitlement.id))
    .map((entitlement) => ({
      ...entitlement,
      id: entitlement.id.trim(),
      type: pickAllowed(entitlement.type, entitlementTypes, 'usage_feature_unlock'),
      source: pickAllowed(entitlement.source, entitlementSources, 'rewarded_interstitial'),
      featureKey: entitlement.featureKey ? pickAllowed(entitlement.featureKey, premiumFeatures, 'csv_export') : undefined,
      startedAt: normalizeIsoString(entitlement.startedAt),
      expiresAt: isNonEmptyString(entitlement.expiresAt) ? entitlement.expiresAt.trim() : undefined,
      remainingUses: normalizeOptionalNonNegativeNumber(entitlement.remainingUses),
      dailyUseDate: isNonEmptyString(entitlement.dailyUseDate) ? entitlement.dailyUseDate.trim() : nowIso().slice(0, 10),
      dailyUseCount: Math.trunc(normalizeNonNegativeNumber(entitlement.dailyUseCount)),
      status: pickAllowed(entitlement.status, entitlementStatuses, 'active'),
      createdAt: normalizeIsoString(entitlement.createdAt),
      updatedAt: normalizeIsoString(entitlement.updatedAt),
    }));
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

  const encryptedEnvelope = parsed as Partial<EncryptedBackupEnvelope>;
  const isEncryptedEnvelope = encryptedEnvelope.encrypted === true && typeof encryptedEnvelope.payload === 'string';

  if (isEncryptedEnvelope) {
    try {
      parsed = decryptPayload(encryptedEnvelope as EncryptedBackupEnvelope, password);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('INVALID_BACKUP_FILE');
    }
  }

  assertBackupPayload(parsed);
  assertBackupRecords(parsed);
  try {
    await exportBackupFile();
  } catch {
    // If the safety backup cannot be created, continue with restore validation.
  }

  const fallbackSettings = await getSettings();
  const nextSettings = parsed.appSettings && typeof parsed.appSettings === 'object'
    ? normalizeRestoredSettings(parsed.appSettings, fallbackSettings)
    : fallbackSettings;
  const categories = Array.isArray(parsed.categories) ? normalizeRestoreCategories(parsed.categories) : [];
  const suppliers = Array.isArray(parsed.suppliers) ? normalizeRestoreSuppliers(parsed.suppliers) : [];
  const categoryIds = new Set(categories.map((category) => category.id).filter((id): id is string => typeof id === 'string' && id.trim().length > 0));
  const supplierIds = new Set(suppliers.map((supplier) => supplier.id).filter((id): id is string => typeof id === 'string' && id.trim().length > 0));
  const products = Array.isArray(parsed.products) ? normalizeRestoreProducts(parsed.products, categoryIds, supplierIds) : [];
  const productIds = new Set(products.map((product) => product.id));
  const stockMovements = Array.isArray(parsed.stockMovements) ? normalizeRestoreMovements(parsed.stockMovements, productIds) : [];
  const adEntitlements = Array.isArray(parsed.adEntitlements) ? normalizeRestoreEntitlements(parsed.adEntitlements) : [];

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
        id, user_name, theme, language, currency, usage_type, onboarding_completed, app_lock_enabled, biometric_unlock_enabled,
        hide_financial_values, ads_enabled, personalized_ads_consent,
        expiration_warning_days, low_stock_warning_enabled, expiration_warning_enabled,
        backup_reminder_enabled, last_backup_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      nextSettings.id,
      nextSettings.userName ?? null,
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
    format: isEncryptedEnvelope ? 'encrypted_json' : 'json',
    fileName: fileUri.split(/[/\\]/).pop(),
    fileUri,
    fileSizeBytes: ((await FileSystem.getInfoAsync(fileUri)) as { size?: number }).size,
    encrypted: isEncryptedEnvelope,
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

  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists || fileInfo.isDirectory) {
    throw new Error('BACKUP_FILE_NOT_FOUND');
  }

  await Sharing.shareAsync(fileUri);
}
