import * as Crypto from 'expo-crypto';
import { getDatabase } from '../db';
import { createAuditLog } from './auditLogRepository';
import type { Supplier } from '@/types/supplier';
import { nowIso } from '@/utils/date';
import { assertTextLength, INPUT_LIMITS } from '@/utils/validators';

type SupplierRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  document: string | null;
  address: string | null;
  notes: string | null;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
};

function mapSupplier(row: SupplierRow): Supplier {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    document: row.document ?? undefined,
    address: row.address ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assertValidEmail(email: string | undefined) {
  if (!email?.trim()) {
    return;
  }

  const normalized = email.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  if (!isValid) {
    throw new Error('INVALID_SUPPLIER_EMAIL');
  }
}

function validateSupplierText(supplier: Supplier) {
  assertTextLength(supplier.name, INPUT_LIMITS.name, 'SUPPLIER_NAME_TOO_LONG');
  assertTextLength(supplier.phone, INPUT_LIMITS.shortText, 'SUPPLIER_PHONE_TOO_LONG');
  assertTextLength(supplier.email, INPUT_LIMITS.shortText, 'SUPPLIER_EMAIL_TOO_LONG');
  assertTextLength(supplier.document, INPUT_LIMITS.shortText, 'SUPPLIER_DOCUMENT_TOO_LONG');
  assertTextLength(supplier.address, INPUT_LIMITS.description, 'SUPPLIER_ADDRESS_TOO_LONG');
  assertTextLength(supplier.notes, INPUT_LIMITS.notes, 'SUPPLIER_NOTES_TOO_LONG');
}

async function assertUniqueSupplierName(name: string, ignoreSupplierId?: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM suppliers
     WHERE status = "active" AND lower(name) = lower(?)
       AND (? IS NULL OR id != ?)
     LIMIT 1`,
    name.trim(),
    ignoreSupplierId ?? null,
    ignoreSupplierId ?? null,
  );
  if (row) {
    throw new Error('SUPPLIER_ALREADY_EXISTS');
  }
}

export async function listSuppliers(includeArchived = false) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SupplierRow>(
    `SELECT * FROM suppliers ${includeArchived ? '' : 'WHERE status = "active"'} ORDER BY name ASC`,
  );
  return rows.map(mapSupplier);
}

export async function createSupplier(input: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<Supplier, 'status'>>) {
  const db = await getDatabase();
  const now = nowIso();
  const name = input.name.trim();
  if (!name) {
    throw new Error('SUPPLIER_NAME_REQUIRED');
  }

  const supplier: Supplier = {
    id: Crypto.randomUUID(),
    name,
    phone: input.phone,
    email: input.email !== undefined ? input.email.trim() || undefined : undefined,
    document: input.document,
    address: input.address,
    notes: input.notes,
    status: input.status ?? 'active',
    createdAt: now,
    updatedAt: now,
  };
  assertValidEmail(supplier.email);
  validateSupplierText(supplier);
  await assertUniqueSupplierName(supplier.name);

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

  await createAuditLog({
    action: 'supplier_created',
    entityType: 'supplier',
    entityId: supplier.id,
  });

  return supplier;
}

export async function updateSupplier(id: string, input: Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>) {
  const db = await getDatabase();
  const current = await db.getFirstAsync<SupplierRow>('SELECT * FROM suppliers WHERE id = ?', id);
  if (!current) {
    return null;
  }

  const next: Supplier = {
    ...mapSupplier(current),
    ...input,
    name: input.name?.trim() ?? current.name,
    email: input.email !== undefined ? input.email.trim() || undefined : current.email ?? undefined,
    updatedAt: nowIso(),
  };
  if (!next.name) {
    throw new Error('SUPPLIER_NAME_REQUIRED');
  }
  assertValidEmail(next.email);
  validateSupplierText(next);
  await assertUniqueSupplierName(next.name, id);

  await db.runAsync(
    `UPDATE suppliers SET name = ?, phone = ?, email = ?, document = ?, address = ?, notes = ?, status = ?, updated_at = ? WHERE id = ?`,
    next.name,
    next.phone ?? null,
    next.email ?? null,
    next.document ?? null,
    next.address ?? null,
    next.notes ?? null,
    next.status,
    next.updatedAt,
    id,
  );

  await createAuditLog({
    action: 'supplier_updated',
    entityType: 'supplier',
    entityId: id,
    metadataJson: JSON.stringify({ status: next.status }),
  });

  return next;
}

export async function archiveSupplier(id: string) {
  const db = await getDatabase();
  const current = await db.getFirstAsync<SupplierRow>('SELECT * FROM suppliers WHERE id = ?', id);
  if (!current) {
    throw new Error('SUPPLIER_NOT_FOUND');
  }
  const linked = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM products WHERE supplier_id = ? AND status = "active"',
    id,
  );
  if ((linked?.total ?? 0) > 0) {
    throw new Error('SUPPLIER_HAS_PRODUCTS');
  }
  await db.runAsync('UPDATE suppliers SET status = ?, updated_at = ? WHERE id = ?', 'archived', nowIso(), id);
  await createAuditLog({
    action: 'supplier_updated',
    entityType: 'supplier',
    entityId: id,
    metadataJson: JSON.stringify({ status: 'archived' }),
  });
}

export async function getSupplierById(id: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SupplierRow>('SELECT * FROM suppliers WHERE id = ?', id);
  return row ? mapSupplier(row) : null;
}
