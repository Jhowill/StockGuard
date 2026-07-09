import { withTransaction } from '@/database/db';
import { createAuditLog } from '@/database/repositories/auditLogRepository';
import { findProductById, updateProduct } from '@/database/repositories/productRepository';
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

export async function createStockMovement(input: CreateStockMovementInput) {
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error('INVALID_QUANTITY');
  }

  return withTransaction(async () => {
    const product = await findProductById(input.productId);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const newQuantity = calculateNewQuantity(product.quantity, input.type, input.quantity);
    if (newQuantity < 0) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    const totalCostCents = input.unitCostCents ? input.unitCostCents * input.quantity : null;
    const totalSaleCents = input.unitSalePriceCents ? input.unitSalePriceCents * input.quantity : null;

    const movement: StockMovementRecord = await createMovement({
      productId: product.id,
      type: input.type,
      reason: input.reason,
      quantity: input.quantity,
      previousQuantity: product.quantity,
      newQuantity,
      unitCostCents: input.unitCostCents ?? null,
      unitSalePriceCents: input.unitSalePriceCents ?? null,
      totalCostCents,
      totalSaleCents,
      currency: input.currency,
      note: input.note ?? null,
    });

    await updateProduct({
      id: product.id,
      quantity: newQuantity,
    });

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
