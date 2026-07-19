import * as FileSystem from 'expo-file-system/legacy';
import * as ExpoCrypto from 'expo-crypto';
import * as Sharing from 'expo-sharing';
import CryptoJS from 'crypto-js';
import { getDatabaseHealth, withExclusiveTransaction, withTransaction } from '@/database/db';
import { listProducts } from '@/database/repositories/productRepository';
import { listCategories } from '@/database/repositories/categoryRepository';
import { listSuppliers } from '@/database/repositories/supplierRepository';
import { listMovements } from '@/database/repositories/stockMovementRepository';
import { getSettings, updateSettings } from '@/database/repositories/settingsRepository';
import { createBackupRecord } from '@/database/repositories/backupRecordRepository';
import { createAuditLog } from '@/database/repositories/auditLogRepository';
import { listAllEntitlements } from '@/database/repositories/adEntitlementRepository';
import { deleteManagedProductImage, isManagedProductImage } from '@/services/productImageService';
import { SCHEMA_VERSION } from '@/database/schema';
import { nowIso } from '@/utils/date';
import { INPUT_LIMITS, isValidIsoDate, isValidMoneyCents, isValidStockQuantity } from '@/utils/validators';
import type { AppSettingsRecord } from '@/database/repositories/settingsRepository';
import type { ProductRecord } from '@/database/repositories/productRepository';
import type { Category } from '@/types/category';
import type { Supplier } from '@/types/supplier';
import type { StockMovementRecord } from '@/database/repositories/stockMovementRepository';
import type { AdEntitlement, AdEntitlementType, AdSource, PremiumFeature } from '@/types/ads';
import type { CurrencyCode, AppLanguage, ThemeMode, UsageType } from '@/types/settings';
import type { ProductUnit } from '@/types/product';
import type { StockMovementType } from '@/types/stock';

const MAX_BACKUP_FILE_BYTES = 20 * 1024 * 1024;
const MAX_BACKUP_RECORDS = 100_000;
const MAX_BACKUP_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_BACKUP_IMAGES_BYTES = 12 * 1024 * 1024;
const ENCRYPTION_ITERATIONS = 100_000;

type BackupProductImage = {
  productId: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  data: string;
};

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
  productImages?: BackupProductImage[];
};

type LegacyEncryptedBackupEnvelope = {
  app: 'EstoqueGuard Offline';
  encrypted: true;
  format: 'encrypted_json';
  schemaVersion: number;
  exportedAt: string;
  payload: string;
};

type EncryptedBackupEnvelope = {
  app: 'EstoqueGuard Offline';
  encrypted: true;
  format: 'encrypted_json';
  encryptionVersion: 2;
  schemaVersion: number;
  exportedAt: string;
  salt: string;
  iv: string;
  iterations: number;
  ciphertext: string;
  mac: string;
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

function imageMimeType(uri: string): BackupProductImage['mimeType'] {
  const normalized = uri.toLowerCase().split(/[?#]/)[0];
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

async function buildProductImages(products: ProductRecord[]) {
  const images: BackupProductImage[] = [];
  let totalBytes = 0;

  for (const product of products) {
    if (!product.imageUri?.trim()) continue;
    const info = await FileSystem.getInfoAsync(product.imageUri);
    const size = (info as { size?: number }).size;
    if (!info.exists || info.isDirectory) continue;
    if (typeof size !== 'number' || size < 0 || size > MAX_BACKUP_IMAGE_BYTES) {
      throw new Error('BACKUP_IMAGE_TOO_LARGE');
    }
    totalBytes += size;
    if (totalBytes > MAX_BACKUP_IMAGES_BYTES) {
      throw new Error('BACKUP_IMAGES_TOO_LARGE');
    }
    images.push({
      productId: product.id,
      mimeType: imageMimeType(product.imageUri),
      data: await FileSystem.readAsStringAsync(product.imageUri, { encoding: 'base64' }),
    });
  }

  return images;
}

export async function buildBackupPayload(): Promise<BackupPayload> {
  const snapshot = await withTransaction(async () => {
    const [products, categories, suppliers, stockMovements, appSettings, adEntitlements] = await Promise.all([
      listProducts(true),
      listCategories(true),
      listSuppliers(true),
      listMovements(0),
      getSettings(),
      listAllEntitlements(),
    ]);
    return { products, categories, suppliers, stockMovements, appSettings, adEntitlements };
  });
  const productImages = await buildProductImages(snapshot.products);

  return {
    app: 'EstoqueGuard Offline',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowIso(),
    locale: snapshot.appSettings.language,
    products: snapshot.products,
    categories: snapshot.categories,
    suppliers: snapshot.suppliers,
    stockMovements: snapshot.stockMovements,
    appSettings: snapshot.appSettings,
    adEntitlements: snapshot.adEntitlements,
    productImages,
  };
}

function assertBackupPayload(payload: Partial<BackupPayload>) {
  if (payload.app !== 'EstoqueGuard Offline') {
    throw new Error('INVALID_BACKUP_FILE');
  }

  if (payload.schemaVersion !== SCHEMA_VERSION && payload.schemaVersion !== 5 && payload.schemaVersion !== 4) {
    throw new Error('INCOMPATIBLE_BACKUP_SCHEMA');
  }

  if (
    !Array.isArray(payload.products)
    || !Array.isArray(payload.categories)
    || !Array.isArray(payload.suppliers)
    || !Array.isArray(payload.stockMovements)
    || (payload.adEntitlements != null && !Array.isArray(payload.adEntitlements))
    || (payload.productImages != null && !Array.isArray(payload.productImages))
  ) {
    throw new Error('INVALID_BACKUP_SCHEMA');
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBoundedString(value: unknown, maxLength: number): value is string {
  return isNonEmptyString(value) && value.trim().length <= maxLength;
}

function isOptionalBoundedString(value: unknown, maxLength: number) {
  return value == null || (typeof value === 'string' && value.trim().length <= maxLength);
}

function assertUniqueIds(records: unknown[], code: string) {
  const ids = new Set<string>();
  for (const record of records) {
    if (!isRecord(record)) throw new Error(code);
    if (!isBoundedString(record.id, INPUT_LIMITS.identifier)) {
      throw new Error(code);
    }
    const id = record.id.trim();
    if (ids.has(id)) {
      throw new Error(code);
    }
    ids.add(id);
  }
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

function isOptionalMoneyCents(value: unknown) {
  return value == null || isValidMoneyCents(value);
}

function normalizeIsoString(value: unknown, fallback = nowIso()): string {
  return isNonEmptyString(value) ? value.trim() : fallback;
}

function assertBackupRecords(payload: Partial<BackupPayload>) {
  const categories = payload.categories ?? [];
  const suppliers = payload.suppliers ?? [];
  const products = payload.products ?? [];
  const movements = payload.stockMovements ?? [];
  const entitlements = payload.adEntitlements ?? [];
  const productImages = payload.productImages ?? [];

  if ([categories, suppliers, products, movements, entitlements].some((records) => records.length > MAX_BACKUP_RECORDS)) {
    throw new Error('BACKUP_RECORD_LIMIT_EXCEEDED');
  }

  assertUniqueIds(categories, 'DUPLICATE_BACKUP_CATEGORY');
  assertUniqueIds(suppliers, 'DUPLICATE_BACKUP_SUPPLIER');
  assertUniqueIds(products, 'DUPLICATE_BACKUP_PRODUCT');
  assertUniqueIds(movements, 'DUPLICATE_BACKUP_MOVEMENT');
  assertUniqueIds(entitlements, 'DUPLICATE_BACKUP_ENTITLEMENT');

  for (const category of categories) {
    if (!isRecord(category)) throw new Error('INVALID_BACKUP_CATEGORY');
    if (
      !isBoundedString(category.id, INPUT_LIMITS.identifier)
      || !isBoundedString(category.name, INPUT_LIMITS.name)
      || !isOptionalBoundedString(category.colorToken, INPUT_LIMITS.shortText)
      || !isOptionalBoundedString(category.iconName, INPUT_LIMITS.shortText)
      || !isFiniteNonNegativeNumber(category.sortOrder)
    ) {
      throw new Error('INVALID_BACKUP_CATEGORY');
    }
  }

  for (const supplier of suppliers) {
    if (!isRecord(supplier)) throw new Error('INVALID_BACKUP_SUPPLIER');
    if (
      !isBoundedString(supplier.id, INPUT_LIMITS.identifier)
      || !isBoundedString(supplier.name, INPUT_LIMITS.name)
      || !isOptionalBoundedString(supplier.phone, INPUT_LIMITS.shortText)
      || !isOptionalBoundedString(supplier.email, INPUT_LIMITS.shortText)
      || !isOptionalBoundedString(supplier.document, INPUT_LIMITS.shortText)
      || !isOptionalBoundedString(supplier.address, INPUT_LIMITS.description)
      || !isOptionalBoundedString(supplier.notes, INPUT_LIMITS.notes)
    ) {
      throw new Error('INVALID_BACKUP_SUPPLIER');
    }
  }

  const categoryIds = new Set(categories.map((category) => category.id));
  const supplierIds = new Set(suppliers.map((supplier) => supplier.id));
  for (const product of products) {
    if (!isRecord(product)) throw new Error('INVALID_BACKUP_PRODUCT');
    if (
      !isBoundedString(product.id, INPUT_LIMITS.identifier)
      || !isBoundedString(product.name, INPUT_LIMITS.name)
      || !isOptionalBoundedString(product.description, INPUT_LIMITS.description)
      || !isOptionalBoundedString(product.sku, INPUT_LIMITS.identifier)
      || !isOptionalBoundedString(product.barcode, INPUT_LIMITS.identifier)
      || !isOptionalBoundedString(product.batchCode, INPUT_LIMITS.shortText)
      || !isOptionalBoundedString(product.location, INPUT_LIMITS.shortText)
      || !isOptionalBoundedString(product.imageUri, INPUT_LIMITS.uri)
      || !isOptionalBoundedString(product.notes, INPUT_LIMITS.notes)
      || (product.categoryId != null && !categoryIds.has(product.categoryId))
      || (product.supplierId != null && !supplierIds.has(product.supplierId))
      || !isValidStockQuantity(product.quantity)
      || !isValidStockQuantity(product.minQuantity)
      || !isOptionalMoneyCents(product.costPriceCents)
      || !isOptionalMoneyCents(product.salePriceCents)
      || !productUnits.includes(product.unit)
      || !currencies.includes(product.currency)
      || !isValidIsoDate(product.expirationDate)
    ) {
      throw new Error('INVALID_BACKUP_PRODUCT');
    }
  }

  const productIds = new Set(products.map((product) => product.id));
  for (const movement of movements) {
    if (!isRecord(movement)) throw new Error('INVALID_BACKUP_MOVEMENT');
    if (
      !isBoundedString(movement.id, INPUT_LIMITS.identifier)
      || !isBoundedString(movement.productId, INPUT_LIMITS.identifier)
      || !productIds.has(movement.productId)
      || !movementTypes.includes(movement.type)
      || !isValidStockQuantity(movement.quantity)
      || movement.quantity <= 0
      || !isValidStockQuantity(movement.previousQuantity)
      || !isValidStockQuantity(movement.newQuantity)
      || !isOptionalMoneyCents(movement.unitCostCents)
      || !isOptionalMoneyCents(movement.unitSalePriceCents)
      || !isOptionalMoneyCents(movement.totalCostCents)
      || !isOptionalMoneyCents(movement.totalSaleCents)
      || !currencies.includes(movement.currency)
      || !isBoundedString(movement.reason, INPUT_LIMITS.shortText)
      || !isOptionalBoundedString(movement.note, INPUT_LIMITS.notes)
      || !isBoundedString(movement.createdAt, INPUT_LIMITS.shortText)
    ) {
      throw new Error('INVALID_BACKUP_MOVEMENT');
    }
  }

  for (const entitlement of entitlements) {
    if (!isRecord(entitlement)) throw new Error('INVALID_BACKUP_ENTITLEMENT');
    if (
      !isBoundedString(entitlement.id, INPUT_LIMITS.identifier)
      || !entitlementTypes.includes(entitlement.type)
      || !entitlementSources.includes(entitlement.source)
      || (entitlement.featureKey != null && !premiumFeatures.includes(entitlement.featureKey))
      || !isBoundedString(entitlement.startedAt, INPUT_LIMITS.shortText)
      || !isOptionalBoundedString(entitlement.expiresAt, INPUT_LIMITS.shortText)
      || (entitlement.remainingUses != null && !isFiniteNonNegativeNumber(entitlement.remainingUses))
      || !isBoundedString(entitlement.dailyUseDate, INPUT_LIMITS.shortText)
      || !isFiniteNonNegativeNumber(entitlement.dailyUseCount)
      || !entitlementStatuses.includes(entitlement.status)
      || !isBoundedString(entitlement.createdAt, INPUT_LIMITS.shortText)
      || !isBoundedString(entitlement.updatedAt, INPUT_LIMITS.shortText)
    ) {
      throw new Error('INVALID_BACKUP_ENTITLEMENT');
    }
  }

  const imageProductIds = new Set<string>();
  let imageBytesEstimate = 0;
  if (productImages.length > products.length) throw new Error('INVALID_BACKUP_IMAGE');
  for (const image of productImages) {
    if (!isRecord(image)) throw new Error('INVALID_BACKUP_IMAGE');
    if (
      !isBoundedString(image.productId, INPUT_LIMITS.identifier)
      || !productIds.has(image.productId)
      || imageProductIds.has(image.productId)
      || !['image/jpeg', 'image/png', 'image/webp'].includes(image.mimeType)
      || typeof image.data !== 'string'
      || !/^[A-Za-z0-9+/]*={0,2}$/.test(image.data)
    ) {
      throw new Error('INVALID_BACKUP_IMAGE');
    }
    imageProductIds.add(image.productId);
    const estimatedBytes = Math.floor((image.data.length * 3) / 4);
    if (estimatedBytes > MAX_BACKUP_IMAGE_BYTES) throw new Error('BACKUP_IMAGE_TOO_LARGE');
    imageBytesEstimate += estimatedBytes;
  }
  if (imageBytesEstimate > MAX_BACKUP_IMAGES_BYTES) throw new Error('BACKUP_IMAGES_TOO_LARGE');

  const settings = payload.appSettings;
  if (
    settings != null
    && (
      typeof settings !== 'object'
      || !isOptionalBoundedString(settings.userName, INPUT_LIMITS.name)
      || !themeModes.includes(settings.theme)
      || !languages.includes(settings.language)
      || !currencies.includes(settings.currency)
      || !usageTypes.includes(settings.usageType)
    )
  ) {
    throw new Error('INVALID_BACKUP_SETTINGS');
  }
}

function upgradeLegacyBackupPayload(payload: Partial<BackupPayload>) {
  if (!Array.isArray(payload.adEntitlements)) return payload;
  return {
    ...payload,
    adEntitlements: payload.adEntitlements.map((value) => {
      if (!isRecord(value)) return value as AdEntitlement;
      const legacy = value as unknown as Record<string, unknown>;
      return {
        ...value,
        featureKey: value.featureKey ?? legacy.feature_key,
        startedAt: value.startedAt ?? legacy.started_at,
        expiresAt: value.expiresAt ?? legacy.expires_at,
        remainingUses: value.remainingUses ?? legacy.remaining_uses,
        dailyUseDate: value.dailyUseDate ?? legacy.daily_use_date,
        dailyUseCount: value.dailyUseCount ?? legacy.daily_use_count,
        createdAt: value.createdAt ?? legacy.created_at,
        updatedAt: value.updatedAt ?? legacy.updated_at,
      } as AdEntitlement;
    }),
  };
}

function bytesToWordArray(bytes: Uint8Array) {
  const words: number[] = [];
  for (let index = 0; index < bytes.length; index += 1) {
    words[index >>> 2] = (words[index >>> 2] ?? 0) | (bytes[index] << (24 - (index % 4) * 8));
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length);
}

function deriveEncryptionKeys(password: string, salt: CryptoJS.lib.WordArray, iterations: number) {
  const derived = CryptoJS.PBKDF2(password, salt, {
    keySize: 512 / 32,
    iterations,
    hasher: CryptoJS.algo.SHA256,
  }).toString(CryptoJS.enc.Hex);
  return {
    encryptionKey: CryptoJS.enc.Hex.parse(derived.slice(0, 64)),
    authenticationKey: CryptoJS.enc.Hex.parse(derived.slice(64, 128)),
  };
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function encryptPayload(payload: BackupPayload, password: string): Promise<EncryptedBackupEnvelope> {
  if (password.trim().length < 6) {
    throw new Error('BACKUP_PASSWORD_TOO_SHORT');
  }

  const salt = bytesToWordArray(await ExpoCrypto.getRandomBytesAsync(16));
  const iv = bytesToWordArray(await ExpoCrypto.getRandomBytesAsync(16));
  const { encryptionKey, authenticationKey } = deriveEncryptionKeys(password, salt, ENCRYPTION_ITERATIONS);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), encryptionKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  const ivBase64 = iv.toString(CryptoJS.enc.Base64);
  const mac = CryptoJS.HmacSHA256(`${ivBase64}.${ciphertext}`, authenticationKey).toString(CryptoJS.enc.Hex);

  return {
    app: 'EstoqueGuard Offline',
    encrypted: true,
    format: 'encrypted_json',
    encryptionVersion: 2,
    schemaVersion: payload.schemaVersion,
    exportedAt: payload.exportedAt,
    salt: salt.toString(CryptoJS.enc.Base64),
    iv: ivBase64,
    iterations: ENCRYPTION_ITERATIONS,
    ciphertext,
    mac,
  };
}

function decryptPayload(envelope: EncryptedBackupEnvelope | LegacyEncryptedBackupEnvelope, password?: string) {
  if (!password?.trim()) {
    throw new Error('BACKUP_PASSWORD_REQUIRED');
  }

  if ('encryptionVersion' in envelope && envelope.encryptionVersion === 2) {
    if (
      !isNonEmptyString(envelope.salt)
      || !isNonEmptyString(envelope.iv)
      || !isNonEmptyString(envelope.ciphertext)
      || !isNonEmptyString(envelope.mac)
      || !Number.isInteger(envelope.iterations)
      || envelope.iterations < 10_000
      || envelope.iterations > 1_000_000
    ) {
      throw new Error('INVALID_BACKUP_FILE');
    }
    const salt = CryptoJS.enc.Base64.parse(envelope.salt);
    const iv = CryptoJS.enc.Base64.parse(envelope.iv);
    const { encryptionKey, authenticationKey } = deriveEncryptionKeys(password, salt, envelope.iterations);
    const expectedMac = CryptoJS.HmacSHA256(`${envelope.iv}.${envelope.ciphertext}`, authenticationKey).toString(CryptoJS.enc.Hex);
    if (!constantTimeEqual(expectedMac, envelope.mac.toLowerCase())) {
      throw new Error('BACKUP_PASSWORD_INVALID');
    }
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(envelope.ciphertext) } as CryptoJS.lib.CipherParams,
      encryptionKey,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
    );
    const raw = decrypted.toString(CryptoJS.enc.Utf8);
    if (!raw) throw new Error('BACKUP_PASSWORD_INVALID');
    try {
      return JSON.parse(raw) as BackupPayload;
    } catch {
      throw new Error('INVALID_BACKUP_FILE');
    }
  }

  const bytes = CryptoJS.AES.decrypt((envelope as LegacyEncryptedBackupEnvelope).payload, password);
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
    // PIN and biometric secrets live in SecureStore and are intentionally not portable.
    appLockEnabled: false,
    biometricUnlockEnabled: false,
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

async function restoreProductImageUris(products: ProductRecord[], images: BackupProductImage[]) {
  const imageMap = new Map(images.map((image) => [image.productId, image]));
  const folder = `${backupFolder()}product-images/`;
  if (images.length > 0) await ensureFolderExists(folder);

  const restored: ProductRecord[] = [];
  for (const product of products) {
    const image = imageMap.get(product.id);
    if (image) {
      const extension = image.mimeType === 'image/png' ? 'png' : image.mimeType === 'image/webp' ? 'webp' : 'jpg';
      const imageUri = `${folder}${ExpoCrypto.randomUUID()}.${extension}`;
      await FileSystem.writeAsStringAsync(imageUri, image.data, { encoding: 'base64' });
      restored.push({ ...product, imageUri });
      continue;
    }

    if (!product.imageUri) {
      restored.push(product);
      continue;
    }

    try {
      const info = await FileSystem.getInfoAsync(product.imageUri);
      restored.push(info.exists && !info.isDirectory ? product : { ...product, imageUri: undefined });
    } catch {
      restored.push({ ...product, imageUri: undefined });
    }
  }
  return restored;
}

export async function exportBackupFile(password?: string) {
  const payload = await buildBackupPayload();
  const encrypted = Boolean(password?.trim());
  const output = encrypted ? await encryptPayload(payload, password ?? '') : payload;
  const folder = backupFolder();
  const fileName = `estoqueguard-backup-${payload.exportedAt.replace(/[:.]/g, '-')}${encrypted ? '.encrypted' : ''}.json`;
  const fileUri = `${folder}${fileName}`;
  await ensureFolderExists(folder);
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(output, null, 2));

  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  const fileSize = (fileInfo as { size?: number }).size;
  if (!fileInfo.exists || fileInfo.isDirectory || (typeof fileSize === 'number' && fileSize > MAX_BACKUP_FILE_BYTES)) {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
    throw new Error('BACKUP_FILE_TOO_LARGE');
  }
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
    metadataJson: JSON.stringify({ encrypted }),
  });
  return { fileUri, fileName, record, payload };
}

export async function restoreBackupFile(fileUri: string, password?: string) {
  if (!fileUri.trim()) {
    throw new Error('INVALID_BACKUP_FILE');
  }

  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  const fileSize = (fileInfo as { size?: number }).size;
  if (!fileInfo.exists || fileInfo.isDirectory || (typeof fileSize === 'number' && fileSize > MAX_BACKUP_FILE_BYTES)) {
    throw new Error('INVALID_BACKUP_FILE');
  }

  const raw = await FileSystem.readAsStringAsync(fileUri);
  let parsed: Partial<BackupPayload>;

  try {
    parsed = JSON.parse(raw) as Partial<BackupPayload>;
  } catch {
    throw new Error('INVALID_BACKUP_FILE');
  }

  const encryptedEnvelope = parsed as Partial<EncryptedBackupEnvelope & LegacyEncryptedBackupEnvelope>;
  const isV2Envelope = encryptedEnvelope.encrypted === true
    && encryptedEnvelope.encryptionVersion === 2
    && typeof encryptedEnvelope.ciphertext === 'string';
  const isLegacyEnvelope = encryptedEnvelope.encrypted === true && typeof encryptedEnvelope.payload === 'string';
  const isEncryptedEnvelope = isV2Envelope || isLegacyEnvelope;

  if (isEncryptedEnvelope) {
    try {
      parsed = decryptPayload(
        isV2Envelope
          ? encryptedEnvelope as EncryptedBackupEnvelope
          : encryptedEnvelope as LegacyEncryptedBackupEnvelope,
        password,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('INVALID_BACKUP_FILE');
    }
  } else if (encryptedEnvelope.encrypted === true) {
    throw new Error('INVALID_BACKUP_FILE');
  }

  parsed = upgradeLegacyBackupPayload(parsed);
  assertBackupPayload(parsed);
  assertBackupRecords(parsed);
  let safetyBackup: Awaited<ReturnType<typeof exportBackupFile>>;
  try {
    safetyBackup = await exportBackupFile();
  } catch {
    throw new Error('BACKUP_SAFETY_COPY_FAILED');
  }
  const previousManagedImageUris = new Set(
    safetyBackup.payload.products
      .map((product) => product.imageUri)
      .filter((uri): uri is string => isManagedProductImage(uri)),
  );

  const fallbackSettings = await getSettings();
  const nextSettings = parsed.appSettings && typeof parsed.appSettings === 'object'
    ? normalizeRestoredSettings(parsed.appSettings, fallbackSettings)
    : fallbackSettings;
  const categories = Array.isArray(parsed.categories) ? normalizeRestoreCategories(parsed.categories) : [];
  const suppliers = Array.isArray(parsed.suppliers) ? normalizeRestoreSuppliers(parsed.suppliers) : [];
  const categoryIds = new Set(categories.map((category) => category.id).filter((id): id is string => typeof id === 'string' && id.trim().length > 0));
  const supplierIds = new Set(suppliers.map((supplier) => supplier.id).filter((id): id is string => typeof id === 'string' && id.trim().length > 0));
  const normalizedProducts = Array.isArray(parsed.products) ? normalizeRestoreProducts(parsed.products, categoryIds, supplierIds) : [];
  const products = await restoreProductImageUris(normalizedProducts, parsed.productImages ?? []);
  const productIds = new Set(products.map((product) => product.id));
  const stockMovements = Array.isArray(parsed.stockMovements) ? normalizeRestoreMovements(parsed.stockMovements, productIds) : [];
  const adEntitlements = Array.isArray(parsed.adEntitlements) ? normalizeRestoreEntitlements(parsed.adEntitlements) : [];

  try {
    await withExclusiveTransaction(async (db) => {
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
  } catch (error) {
    await Promise.all(products
      .map((product) => product.imageUri)
      .filter((uri): uri is string => typeof uri === 'string' && isManagedProductImage(uri) && !previousManagedImageUris.has(uri))
      .map((uri) => deleteManagedProductImage(uri)));
    throw error;
  }

  const health = await getDatabaseHealth();
  if (health.foreignKeyViolations > 0 || health.schemaVersion <= 0) {
    throw new Error('DATABASE_INTEGRITY_CHECK_FAILED');
  }

  const restoredManagedImageUris = new Set(
    products
      .map((product) => product.imageUri)
      .filter((uri): uri is string => typeof uri === 'string' && isManagedProductImage(uri)),
  );
  await Promise.all([...previousManagedImageUris]
    .filter((uri) => !restoredManagedImageUris.has(uri))
    .map((uri) => deleteManagedProductImage(uri)));

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
    metadataJson: JSON.stringify({ encrypted: record.encrypted }),
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
