import * as Crypto from 'expo-crypto';
import { getDatabase } from '../db';
import type { StockMovementType } from '@/types/stock';
import type { CurrencyCode } from '@/types/settings';
import { nowIso } from '@/utils/date';

export type StockMovementRecord = {
  id: string;
  productId: string;
  type: StockMovementType;
  reason: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitCostCents?: number | null;
  unitSalePriceCents?: number | null;
  totalCostCents?: number | null;
  totalSaleCents?: number | null;
  currency: CurrencyCode;
  note?: string | null;
  createdAt: string;
};

type StockMovementRow = {
  id: string;
  product_id: string;
  type: StockMovementType;
  reason: string;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  unit_cost_cents: number | null;
  unit_sale_price_cents: number | null;
  total_cost_cents: number | null;
  total_sale_cents: number | null;
  currency: CurrencyCode;
  note: string | null;
  created_at: string;
};

type CreateStockMovementInput = Omit<StockMovementRecord, 'id' | 'createdAt'> & { createdAt?: string };

function mapMovement(row: StockMovementRow): StockMovementRecord {
  return {
    id: row.id,
    productId: row.product_id,
    type: row.type,
    reason: row.reason,
    quantity: row.quantity,
    previousQuantity: row.previous_quantity,
    newQuantity: row.new_quantity,
    unitCostCents: row.unit_cost_cents,
    unitSalePriceCents: row.unit_sale_price_cents,
    totalCostCents: row.total_cost_cents,
    totalSaleCents: row.total_sale_cents,
    currency: row.currency,
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function createMovement(input: CreateStockMovementInput) {
  const db = await getDatabase();
  const movement: StockMovementRecord = {
    id: Crypto.randomUUID(),
    createdAt: input.createdAt ?? nowIso(),
    productId: input.productId,
    type: input.type,
    reason: input.reason,
    quantity: input.quantity,
    previousQuantity: input.previousQuantity,
    newQuantity: input.newQuantity,
    unitCostCents: input.unitCostCents ?? null,
    unitSalePriceCents: input.unitSalePriceCents ?? null,
    totalCostCents: input.totalCostCents ?? null,
    totalSaleCents: input.totalSaleCents ?? null,
    currency: input.currency,
    note: input.note ?? null,
  };

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

  return movement;
}

export async function findMovementsByProductId(productId: string, limit = 50) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<StockMovementRow>(
    `SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT ?`,
    productId,
    limit,
  );
  return rows.map(mapMovement);
}

export async function getRecentMovements(limit = 10) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<StockMovementRow>(
    `SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT ?`,
    limit,
  );
  return rows.map(mapMovement);
}

export async function listMovements(limit = 200) {
  const db = await getDatabase();
  const rows = typeof limit === 'number' && Number.isFinite(limit) && limit > 0
    ? await db.getAllAsync<StockMovementRow>(
        `SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT ?`,
        limit,
      )
    : await db.getAllAsync<StockMovementRow>(`SELECT * FROM stock_movements ORDER BY created_at DESC`);
  return rows.map(mapMovement);
}

export async function findMovementsByDateRange(dateFrom: string, dateTo: string) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<StockMovementRow>(
    `SELECT * FROM stock_movements
     WHERE created_at >= ? AND created_at <= ?
     ORDER BY created_at DESC`,
    dateFrom,
    dateTo,
  );
  return rows.map(mapMovement);
}
