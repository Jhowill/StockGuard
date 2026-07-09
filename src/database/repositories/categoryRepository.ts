import * as Crypto from 'expo-crypto';
import { getDatabase } from '../db';
import type { Category } from '@/types/category';
import { nowIso } from '@/utils/date';

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
  const id = Crypto.randomUUID();
  const category: Category = {
    id,
    name: input.name,
    colorToken: input.colorToken,
    iconName: input.iconName,
    sortOrder: input.sortOrder,
    status: input.status ?? 'active',
    createdAt: now,
    updatedAt: now,
  };

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

  return category;
}

export async function archiveCategory(id: string) {
  const db = await getDatabase();
  await db.runAsync('UPDATE categories SET status = ?, updated_at = ? WHERE id = ?', 'archived', nowIso(), id);
}
