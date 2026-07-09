import * as Crypto from 'expo-crypto';
import { getDatabase } from '../db';
import type { Supplier } from '@/types/supplier';
import { nowIso } from '@/utils/date';

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
  const supplier: Supplier = {
    id: Crypto.randomUUID(),
    name: input.name,
    phone: input.phone,
    email: input.email,
    document: input.document,
    address: input.address,
    notes: input.notes,
    status: input.status ?? 'active',
    createdAt: now,
    updatedAt: now,
  };

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

  return supplier;
}
