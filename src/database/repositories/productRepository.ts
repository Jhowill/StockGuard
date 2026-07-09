import * as Crypto from 'expo-crypto';
import { getDatabase } from '../db';
import type { ProductUnit } from '@/types/product';
import { nowIso } from '@/utils/date';

export type ProductRecord = {
  id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  categoryId?: string | null;
  supplierId?: string | null;
  quantity: number;
  minQuantity: number;
  unit: ProductUnit;
  costPriceCents?: number | null;
  salePriceCents?: number | null;
  currency: 'BRL' | 'USD' | 'EUR';
  expirationDate?: string | null;
  batchCode?: string | null;
  location?: string | null;
  imageUri?: string | null;
  notes?: string | null;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  category_id: string | null;
  supplier_id: string | null;
  quantity: number;
  min_quantity: number;
  unit: ProductUnit;
  cost_price_cents: number | null;
  sale_price_cents: number | null;
  currency: 'BRL' | 'USD' | 'EUR';
  expiration_date: string | null;
  batch_code: string | null;
  location: string | null;
  image_uri: string | null;
  notes: string | null;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type CreateProductInput = {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  supplierId?: string;
  quantity?: number;
  initialQuantity?: number;
  minQuantity: number;
  unit: ProductUnit;
  costPriceCents?: number | null;
  salePriceCents?: number | null;
  currency: ProductRecord['currency'];
  expirationDate?: string | null;
  batchCode?: string | null;
  location?: string | null;
  imageUri?: string | null;
  notes?: string | null;
};

export type UpdateProductInput = Partial<Omit<CreateProductInput, 'initialQuantity'>> & {
  id: string;
};

function mapProduct(row: ProductRow): ProductRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    sku: row.sku,
    barcode: row.barcode,
    categoryId: row.category_id,
    supplierId: row.supplier_id,
    quantity: row.quantity,
    minQuantity: row.min_quantity,
    unit: row.unit,
    costPriceCents: row.cost_price_cents,
    salePriceCents: row.sale_price_cents,
    currency: row.currency,
    expirationDate: row.expiration_date,
    batchCode: row.batch_code,
    location: row.location,
    imageUri: row.image_uri,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  };
}

function assertNonNegativeNumber(value: number, code: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(code);
  }
}

function assertOptionalNonNegativeInteger(value: number | null | undefined, code: string) {
  if (value == null) {
    return;
  }

  if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
    throw new Error(code);
  }
}

function validateProduct(record: Pick<ProductRecord, 'name' | 'quantity' | 'minQuantity' | 'costPriceCents' | 'salePriceCents'>) {
  if (!record.name.trim()) {
    throw new Error('PRODUCT_NAME_REQUIRED');
  }

  assertNonNegativeNumber(record.quantity, 'INVALID_PRODUCT_QUANTITY');
  assertNonNegativeNumber(record.minQuantity, 'INVALID_PRODUCT_MIN_QUANTITY');
  assertOptionalNonNegativeInteger(record.costPriceCents, 'INVALID_PRODUCT_COST_PRICE');
  assertOptionalNonNegativeInteger(record.salePriceCents, 'INVALID_PRODUCT_SALE_PRICE');
}

export async function createProduct(input: CreateProductInput) {
  const db = await getDatabase();
  const now = nowIso();
  const product: ProductRecord = {
    id: Crypto.randomUUID(),
    name: input.name.trim(),
    description: input.description,
    sku: input.sku,
    barcode: input.barcode,
    categoryId: input.categoryId,
    supplierId: input.supplierId,
    quantity: input.initialQuantity ?? input.quantity ?? 0,
    minQuantity: input.minQuantity,
    unit: input.unit,
    costPriceCents: input.costPriceCents,
    salePriceCents: input.salePriceCents,
    currency: input.currency,
    expirationDate: input.expirationDate,
    batchCode: input.batchCode,
    location: input.location,
    imageUri: input.imageUri,
    notes: input.notes,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  };
  validateProduct(product);

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

  return product;
}

export async function updateProduct(input: UpdateProductInput) {
  const db = await getDatabase();
  const current = await findProductById(input.id);
  if (!current) {
    return null;
  }

  const next: ProductRecord = {
    ...current,
    ...input,
    name: input.name?.trim() ?? current.name,
    updatedAt: nowIso(),
  };
  validateProduct(next);

  await db.runAsync(
    `UPDATE products SET
      name = ?, description = ?, sku = ?, barcode = ?, category_id = ?, supplier_id = ?,
      quantity = ?, min_quantity = ?, unit = ?, cost_price_cents = ?, sale_price_cents = ?, currency = ?,
      expiration_date = ?, batch_code = ?, location = ?, image_uri = ?, notes = ?,
      status = ?, updated_at = ?, archived_at = ?
     WHERE id = ?`,
    next.name,
    next.description ?? null,
    next.sku ?? null,
    next.barcode ?? null,
    next.categoryId ?? null,
    next.supplierId ?? null,
    next.quantity,
    next.minQuantity,
    next.unit,
    next.costPriceCents ?? null,
    next.salePriceCents ?? null,
    next.currency,
    next.expirationDate ?? null,
    next.batchCode ?? null,
    next.location ?? null,
    next.imageUri ?? null,
    next.notes ?? null,
    next.status,
    next.updatedAt,
    next.archivedAt ?? null,
    next.id,
  );

  return next;
}

export async function archiveProduct(productId: string) {
  const db = await getDatabase();
  const now = nowIso();
  await db.runAsync(
    'UPDATE products SET status = ?, archived_at = ?, updated_at = ? WHERE id = ?',
    'archived',
    now,
    now,
    productId,
  );
}

export async function findProductById(productId: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ProductRow>('SELECT * FROM products WHERE id = ?', productId);
  return row ? mapProduct(row) : null;
}

export async function listProducts(includeArchived = false) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProductRow>(
    `SELECT * FROM products ${includeArchived ? '' : 'WHERE status = "active"'} ORDER BY updated_at DESC`,
  );
  return rows.map(mapProduct);
}

export async function searchProducts(query: string) {
  const db = await getDatabase();
  const like = `%${query.trim()}%`;
  const rows = await db.getAllAsync<ProductRow>(
    `SELECT * FROM products
     WHERE status = "active" AND (
       name LIKE ? OR sku LIKE ? OR barcode LIKE ? OR location LIKE ?
     )
     ORDER BY name ASC`,
    like,
    like,
    like,
    like,
  );
  return rows.map(mapProduct);
}

export async function getLowStockProducts() {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProductRow>(
    'SELECT * FROM products WHERE status = "active" AND quantity <= min_quantity ORDER BY quantity ASC',
  );
  return rows.map(mapProduct);
}

export async function getExpiringProducts(days = 7) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProductRow>(
    `SELECT * FROM products
     WHERE status = "active"
       AND expiration_date IS NOT NULL
       AND expiration_date <= date('now', ?)
     ORDER BY expiration_date ASC`,
    `+${days} days`,
  );
  return rows.map(mapProduct);
}
