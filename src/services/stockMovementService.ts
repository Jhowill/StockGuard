import { withTransaction } from '@/database/db';
import { createAuditLog } from '@/database/repositories/auditLogRepository';
import {
  createProduct,
  findProductById,
  setProductQuantity,
  type CreateProductInput,
} from '@/database/repositories/productRepository';
import { createMovement, type StockMovementRecord } from '@/database/repositories/stockMovementRepository';
import type { CurrencyCode } from '@/types/settings';
import type { StockMovementType } from '@/types/stock';
import { assertTextLength, INPUT_LIMITS, isValidMoneyCents, isValidStockQuantity } from '@/utils/validators';

type CreateStockMovementInput = {
  productId: string;
  type: StockMovementType;
  reason: string;
  quantity: number;
  unitCostCents?: number;
  unitSalePriceCents?: number;
  note?: string;
  currency: CurrencyCode;
};

const productMovementQueues = new Map<string, Promise<void>>();

async function withProductMovementLock<T>(productId: string, operation: () => Promise<T>): Promise<T> {
  const key = productId.trim();
  const previous = productMovementQueues.get(key) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const queued = previous.catch(() => undefined).then(() => current);
  productMovementQueues.set(key, queued);

  await previous.catch(() => undefined);
  try {
    return await operation();
  } finally {
    release();
    if (productMovementQueues.get(key) === queued) {
      productMovementQueues.delete(key);
    }
  }
}

function calculateNewQuantity(previousQuantity: number, movementType: StockMovementType, quantity: number) {
  let result: number;
  if (movementType === 'in' || movementType === 'return' || movementType === 'adjustment_positive') {
    result = previousQuantity + quantity;
  } else if (movementType === 'out' || movementType === 'loss' || movementType === 'adjustment_negative') {
    result = previousQuantity - quantity;
  } else {
    result = quantity;
  }

  return Math.round(result * 1000) / 1000;
}

function assertOptionalMoney(value: number | undefined, field: string) {
  if (value == null) {
    return;
  }

  if (!isValidMoneyCents(value)) {
    throw new Error(field);
  }
}

function resolveMovementPrices(
  movementType: StockMovementType,
  input: Pick<CreateStockMovementInput, 'unitCostCents' | 'unitSalePriceCents'>,
  product: { costPriceCents?: number | null; salePriceCents?: number | null },
  quantity: number,
) {
  const unitCostCents = input.unitCostCents ?? product.costPriceCents ?? null;
  const unitSalePriceCents = input.unitSalePriceCents ?? product.salePriceCents ?? null;
  const shouldTrackCost = movementType === 'in' || movementType === 'return' || movementType === 'loss' || movementType === 'adjustment_positive' || movementType === 'adjustment_negative';
  const shouldTrackSale = movementType === 'out';

  return {
    unitCostCents,
    unitSalePriceCents,
    totalCostCents: shouldTrackCost && unitCostCents != null ? Math.round(unitCostCents * quantity) : null,
    totalSaleCents: shouldTrackSale && unitSalePriceCents != null ? Math.round(unitSalePriceCents * quantity) : null,
  };
}

async function createStockMovementRecord(input: CreateStockMovementInput) {
  if (!input.productId.trim()) {
    throw new Error('PRODUCT_ID_MISSING');
  }

  if (!isValidStockQuantity(input.quantity) || input.quantity <= 0) {
    throw new Error('INVALID_QUANTITY');
  }

  assertOptionalMoney(input.unitCostCents, 'INVALID_UNIT_COST');
  assertOptionalMoney(input.unitSalePriceCents, 'INVALID_UNIT_SALE_PRICE');
  assertTextLength(input.reason, INPUT_LIMITS.shortText, 'MOVEMENT_REASON_TOO_LONG');
  assertTextLength(input.note, INPUT_LIMITS.notes, 'MOVEMENT_NOTE_TOO_LONG');

  const product = await findProductById(input.productId);
  if (!product) {
    throw new Error('PRODUCT_NOT_FOUND');
  }

  const newQuantity = calculateNewQuantity(product.quantity, input.type, input.quantity);
  if (newQuantity < 0) {
    throw new Error('INSUFFICIENT_STOCK');
  }
  if (!isValidStockQuantity(newQuantity)) {
    throw new Error('INVALID_QUANTITY');
  }

  const prices = resolveMovementPrices(input.type, input, product, input.quantity);
  if (
    (prices.totalCostCents != null && !isValidMoneyCents(prices.totalCostCents))
    || (prices.totalSaleCents != null && !isValidMoneyCents(prices.totalSaleCents))
  ) {
    throw new Error('INVALID_MOVEMENT_TOTAL');
  }

  const movement: StockMovementRecord = await createMovement({
    productId: product.id,
    type: input.type,
    reason: input.reason.trim() || 'other',
    quantity: input.quantity,
    previousQuantity: product.quantity,
    newQuantity,
    unitCostCents: prices.unitCostCents,
    unitSalePriceCents: prices.unitSalePriceCents,
    totalCostCents: prices.totalCostCents,
    totalSaleCents: prices.totalSaleCents,
    currency: input.currency,
    note: input.note ?? null,
  });

  await setProductQuantity(product.id, newQuantity);

  await createAuditLog({
    action: 'stock_movement_created',
    entityType: 'product',
    entityId: product.id,
    metadataJson: JSON.stringify({
      movementId: movement.id,
      type: input.type,
      quantity: input.quantity,
    }),
  });

  return movement;
}

export async function createStockMovement(input: CreateStockMovementInput) {
  return withProductMovementLock(input.productId, () => withTransaction(() => createStockMovementRecord(input)));
}

export async function createProductWithInitialStock(input: CreateProductInput) {
  const initialQuantity = input.initialQuantity ?? input.quantity ?? 0;
  if (!isValidStockQuantity(initialQuantity)) {
    throw new Error('INVALID_PRODUCT_QUANTITY');
  }

  return withTransaction(async () => {
    const product = await createProduct({
      ...input,
      quantity: 0,
      initialQuantity: 0,
    });

    if (initialQuantity > 0) {
      await createStockMovementRecord({
        productId: product.id,
        type: 'initial_balance',
        reason: 'initial_setup',
        quantity: initialQuantity,
        currency: product.currency,
      });
    }

    return { ...product, quantity: initialQuantity };
  });
}
