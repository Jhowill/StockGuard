import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { createAuditLog } from '@/database/repositories/auditLogRepository';
import type { ReportSummary } from './reportService';
import { formatMoney } from '@/utils/format';
import { nowIso } from '@/utils/date';

function exportFolder() {
  const folder = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!folder) {
    throw new Error('EXPORT_FOLDER_UNAVAILABLE');
  }
  return folder;
}

async function shareIfAvailable(fileUri: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }
}

function csvCell(value: string | number | undefined) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export async function exportReportCsv(summary: ReportSummary) {
  const rows = [
    ['Periodo', summary.period],
    ['Entradas', summary.entriesValueCents],
    ['Saidas', summary.exitsValueCents],
    ['Lucro estimado', summary.estimatedProfitCents ?? 0],
    ['Produtos movimentados', summary.movedProductsCount],
    [],
    ['Produto', 'Quantidade'],
    ...summary.topProductsByQuantity.map((product) => [product.productName, product.quantity]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
  const fileName = `estoqueguard-relatorio-${nowIso().replace(/[:.]/g, '-')}.csv`;
  const fileUri = `${exportFolder()}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, csv);
  await createAuditLog({
    action: 'data_exported',
    entityType: 'report',
    entityId: summary.period,
    metadataJson: JSON.stringify({ format: 'csv', fileName }),
  });
  await shareIfAvailable(fileUri);
  return fileUri;
}

export async function exportReportPdf(summary: ReportSummary) {
  const rows = summary.topProductsByQuantity
    .map((product) => `<tr><td>${product.productName}</td><td>${product.quantity}</td></tr>`)
    .join('');
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h1>EstoqueGuard Offline</h1>
        <h2>Relatorio de estoque</h2>
        <p>Periodo: ${summary.period}</p>
        <ul>
          <li>Entradas: ${formatMoney(summary.entriesValueCents, summary.currency)}</li>
          <li>Saidas: ${formatMoney(summary.exitsValueCents, summary.currency)}</li>
          <li>Lucro estimado: ${formatMoney(summary.estimatedProfitCents ?? 0, summary.currency)}</li>
          <li>Produtos movimentados: ${summary.movedProductsCount}</li>
        </ul>
        <h3>Principais produtos</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><th align="left">Produto</th><th align="left">Quantidade</th></tr>
          ${rows || '<tr><td colspan="2">Sem dados no periodo.</td></tr>'}
        </table>
      </body>
    </html>
  `;
  const result = await Print.printToFileAsync({ html });
  await createAuditLog({
    action: 'data_exported',
    entityType: 'report',
    entityId: summary.period,
    metadataJson: JSON.stringify({ format: 'pdf', fileUri: result.uri }),
  });
  await shareIfAvailable(result.uri);
  return result.uri;
}
