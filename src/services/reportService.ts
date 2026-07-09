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
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const day = 24 * 60 * 60 * 1000;

  switch (period) {
    case 'today':
      return diffMs <= day && date.getDate() === now.getDate();
    case 'week':
      return diffMs <= 7 * day;
    case 'month':
      return diffMs <= 30 * day;
    default:
      return true;
  }
}

export async function getReportSummary(period: ReportPeriod = 'month'): Promise<ReportSummary> {
  const [products, movements] = await Promise.all([listProducts(), listMovements(1000)]);
  const currency: CurrencyCode = products[0]?.currency ?? 'BRL';

  const filtered = movements.filter((movement) => isInPeriod(new Date(movement.createdAt), period));
  const entriesValueCents = filtered
    .filter((movement) => movement.type === 'in' || movement.type === 'return' || movement.type === 'adjustment_positive')
    .reduce((sum, movement) => sum + (movement.totalCostCents ?? movement.quantity * 0), 0);
  const exitsValueCents = filtered
    .filter((movement) => movement.type === 'out' || movement.type === 'loss' || movement.type === 'adjustment_negative')
    .reduce((sum, movement) => sum + (movement.totalSaleCents ?? movement.quantity * 0), 0);

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
    estimatedProfitCents: exitsValueCents - entriesValueCents,
    movedProductsCount: movementMap.size,
    topProductsByQuantity,
    currency,
  };
}

export async function getReportCards(period: ReportPeriod = 'month') {
  const summary = await getReportSummary(period);
  return {
    summary,
    formattedEntries: formatMoney(summary.entriesValueCents, summary.currency),
    formattedExits: formatMoney(summary.exitsValueCents, summary.currency),
  };
}
