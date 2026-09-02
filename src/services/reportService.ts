import { listMovements } from '@/database/repositories/stockMovementRepository';
import { listProducts, type ProductRecord } from '@/database/repositories/productRepository';
import { formatMoney } from '@/utils/format';
import type { CurrencyCode } from '@/types/settings';

export type ReportPeriod = 'today' | 'week' | 'month' | 'custom';

export type ReportSummary = {
  period: ReportPeriod;
  entriesValueCents: number;
  exitsValueCents: number;
  estimatedProfitCents?: number;
  movedProductsCount: number;
  topProductsByQuantity: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
  currency: CurrencyCode;
};

function isInPeriod(date: Date, period: ReportPeriod) {
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  if (date.getTime() > now.getTime()) {
    return false;
  }

  const diffMs = now.getTime() - date.getTime();
  const day = 24 * 60 * 60 * 1000;

  switch (period) {
    case 'today':
      return date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate();
    case 'week':
      return diffMs <= 7 * day;
    case 'month':
      return diffMs <= 30 * day;
    default:
      return true;
  }
}

function getProductPrice(products: ProductRecord[], productId: string, field: 'costPriceCents' | 'salePriceCents') {
  return products.find((product) => product.id === productId)?.[field] ?? 0;
}

function movementValueCents(
  movement: Awaited<ReturnType<typeof listMovements>>[number],
  products: ProductRecord[],
  field: 'totalCostCents' | 'totalSaleCents',
) {
  const stored = movement[field];
  if (typeof stored === 'number' && Number.isFinite(stored) && stored >= 0) {
    return stored;
  }

  const storedUnit = field === 'totalCostCents' ? movement.unitCostCents : movement.unitSalePriceCents;
  if (typeof storedUnit === 'number' && Number.isFinite(storedUnit) && storedUnit >= 0) {
    return Math.round(storedUnit * movement.quantity);
  }

  const unitField = field === 'totalCostCents' ? 'costPriceCents' : 'salePriceCents';
  return Math.round(getProductPrice(products, movement.productId, unitField) * movement.quantity);
}

export async function getReportSummary(period: ReportPeriod = 'month', currency: CurrencyCode = 'BRL'): Promise<ReportSummary> {
  const [products, movements] = await Promise.all([listProducts(), listMovements(0)]);

  // Never aggregate monetary values from different currencies into one total.
  const filtered = movements.filter(
    (movement) => movement.currency === currency && isInPeriod(new Date(movement.createdAt), period),
  );
  const entriesValueCents = filtered
    .filter((movement) => movement.type === 'in' || movement.type === 'return' || movement.type === 'adjustment_positive')
    .reduce((sum, movement) => sum + movementValueCents(movement, products, 'totalCostCents'), 0);
  const exitsValueCents = filtered
    .filter((movement) => movement.type === 'out' || movement.type === 'loss' || movement.type === 'adjustment_negative')
    .reduce((sum, movement) => {
      const valueField = movement.type === 'out' ? 'totalSaleCents' : 'totalCostCents';
      return sum + movementValueCents(movement, products, valueField);
    }, 0);
  const estimatedProfitCents = filtered
    .filter((movement) => movement.type === 'out')
    .reduce((sum, movement) => {
      const revenue = movementValueCents(movement, products, 'totalSaleCents');
      const cost = movementValueCents(movement, products, 'totalCostCents');
      return sum + revenue - cost;
    }, 0);

  const movementMap = new Map<string, number>();
  filtered.forEach((movement) => {
    movementMap.set(movement.productId, (movementMap.get(movement.productId) ?? 0) + movement.quantity);
  });

  const topProductsByQuantity = [...movementMap.entries()]
    .map(([productId, quantity]) => ({
      productId,
      productName: products.find((product) => product.id === productId)?.name ?? productId,
      quantity,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    period,
    entriesValueCents,
    exitsValueCents,
    estimatedProfitCents,
    movedProductsCount: movementMap.size,
    topProductsByQuantity,
    currency,
  };
}

export async function getReportCards(period: ReportPeriod = 'month', locale = 'pt-BR', currency: CurrencyCode = 'BRL') {
  const summary = await getReportSummary(period, currency);
  return {
    summary,
    formattedEntries: formatMoney(summary.entriesValueCents, summary.currency, locale),
    formattedExits: formatMoney(summary.exitsValueCents, summary.currency, locale),
  };
}
