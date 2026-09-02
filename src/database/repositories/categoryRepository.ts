import * as Crypto from 'expo-crypto';
import { getDatabase } from '../db';
import { createAuditLog } from './auditLogRepository';
import type { Category } from '@/types/category';
import { nowIso } from '@/utils/date';
import { assertTextLength, INPUT_LIMITS } from '@/utils/validators';

type CategoryRow = {
  id: string;
  name: string;
  color_token: string | null;
  icon_name: string | null;
  sort_order: number;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    colorToken: row.color_token ?? undefined,
    iconName: row.icon_name ?? undefined,
    sortOrder: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assertUniqueCategoryName(name: string, ignoreCategoryId?: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM categories
     WHERE status = "active" AND lower(name) = lower(?)
       AND (? IS NULL OR id != ?)
     LIMIT 1`,
    name.trim(),
    ignoreCategoryId ?? null,
    ignoreCategoryId ?? null,
  );

  if (row) {
    throw new Error('CATEGORY_ALREADY_EXISTS');
  }
}

export async function listCategories(includeArchived = false) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CategoryRow>(
    `SELECT * FROM categories ${includeArchived ? '' : 'WHERE status = "active"'} ORDER BY sort_order ASC, name ASC`,
  );
  return rows.map(mapCategory);
}

export async function createCategory(input: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<Category, 'status'>>) {
  const db = await getDatabase();
  const now = nowIso();
  const name = input.name.trim();
  if (!name) {
    throw new Error('CATEGORY_NAME_REQUIRED');
  }
  assertTextLength(name, INPUT_LIMITS.name, 'CATEGORY_NAME_TOO_LONG');
  if (!Number.isFinite(input.sortOrder) || input.sortOrder < 0 || !Number.isInteger(input.sortOrder)) {
    throw new Error('INVALID_CATEGORY_SORT_ORDER');
  }

  const id = Crypto.randomUUID();
  const category: Category = {
    id,
    name,
    colorToken: input.colorToken,
    iconName: input.iconName,
    sortOrder: input.sortOrder,
    status: input.status ?? 'active',
    createdAt: now,
    updatedAt: now,
  };
  await assertUniqueCategoryName(category.name);

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

  await createAuditLog({
    action: 'category_created',
    entityType: 'category',
    entityId: category.id,
  });

  return category;
}

export async function updateCategory(id: string, input: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) {
  const db = await getDatabase();
  const current = await db.getFirstAsync<CategoryRow>('SELECT * FROM categories WHERE id = ?', id);
  if (!current) {
    return null;
  }

  const next: Category = {
    ...mapCategory(current),
    ...input,
    name: input.name?.trim() ?? current.name,
    updatedAt: nowIso(),
  };
  if (!next.name) {
    throw new Error('CATEGORY_NAME_REQUIRED');
  }
  assertTextLength(next.name, INPUT_LIMITS.name, 'CATEGORY_NAME_TOO_LONG');
  if (!Number.isFinite(next.sortOrder) || next.sortOrder < 0 || !Number.isInteger(next.sortOrder)) {
    throw new Error('INVALID_CATEGORY_SORT_ORDER');
  }
  await assertUniqueCategoryName(next.name, id);

  await db.runAsync(
    `UPDATE categories SET name = ?, color_token = ?, icon_name = ?, sort_order = ?, status = ?, updated_at = ? WHERE id = ?`,
    next.name,
    next.colorToken ?? null,
    next.iconName ?? null,
    next.sortOrder,
    next.status,
    next.updatedAt,
    id,
  );

  await createAuditLog({
    action: 'category_updated',
    entityType: 'category',
    entityId: id,
    metadataJson: JSON.stringify({ status: next.status }),
  });

  return next;
}

export async function archiveCategory(id: string) {
  const db = await getDatabase();
  const current = await db.getFirstAsync<CategoryRow>('SELECT * FROM categories WHERE id = ?', id);
  if (!current) {
    throw new Error('CATEGORY_NOT_FOUND');
  }
  const linked = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND status = "active"',
    id,
  );
  if ((linked?.total ?? 0) > 0) {
    throw new Error('CATEGORY_HAS_PRODUCTS');
  }
  await db.runAsync('UPDATE categories SET status = ?, updated_at = ? WHERE id = ?', 'archived', nowIso(), id);
  await createAuditLog({
    action: 'category_updated',
    entityType: 'category',
    entityId: id,
    metadataJson: JSON.stringify({ status: 'archived' }),
  });
}

export async function getCategoryById(id: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CategoryRow>('SELECT * FROM categories WHERE id = ?', id);
  return row ? mapCategory(row) : null;
}
