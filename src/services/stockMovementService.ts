import { withTransaction } from '@/database/db';
import { createAuditLog } from '@/database/repositories/auditLogRepository';
import { findProductById, setProductQuantity } from '@/database/repositories/productRepository';
import { createMovement, type StockMovementRecord } from '@/database/repositories/stockMovementRepository';
import type { CurrencyCode } from '@/types/settings';
import type { StockMovementType } from '@/types/stock';

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

function calculateNewQuantity(previousQuantity: number, movementType: StockMovementType, quantity: number) {
  if (movementType === 'in' || movementType === 'return' || movementType === 'adjustment_positive') {
    return previousQuantity + quantity;
  }

  if (movementType === 'out' || movementType === 'loss' || movementType === 'adjustment_negative') {
    return previousQuantity - quantity;
  }

  return quantity;
}

function assertOptionalMoney(value: number | undefined, field: string) {
  if (value == null) {
    return;
  }

  if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
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

export async function createStockMovement(input: CreateStockMovementInput) {
  if (!input.productId.trim()) {
    throw new Error('PRODUCT_ID_MISSING');
  }

  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error('INVALID_QUANTITY');
  }

  assertOptionalMoney(input.unitCostCents, 'INVALID_UNIT_COST');
  assertOptionalMoney(input.unitSalePriceCents, 'INVALID_UNIT_SALE_PRICE');

  return withTransaction(async () => {
    const product = await findProductById(input.productId);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const newQuantity = calculateNewQuantity(product.quantity, input.type, input.quantity);
    if (newQuantity < 0) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    const prices = resolveMovementPrices(input.type, input, product, input.quantity);

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
  });
}
