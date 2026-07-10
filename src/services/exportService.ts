import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { createAuditLog } from '@/database/repositories/auditLogRepository';
import type { ReportSummary } from './reportService';
import { formatMoney } from '@/utils/format';
import { nowIso } from '@/utils/date';
import { formatShortDateTime } from '@/utils/date-format';

function exportFolder() {
  const folder = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!folder) {
    throw new Error('EXPORT_FOLDER_UNAVAILABLE');
  }

  return folder;
}

async function ensureExportFolder() {
  const folder = exportFolder();
  const info = await FileSystem.getInfoAsync(folder);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
  }

  return folder;
}

async function shareIfAvailable(fileUri: string) {
  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists || info.isDirectory) {
    throw new Error('EXPORT_FILE_NOT_FOUND');
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }
}

function csvCell(value: string | number | undefined | null) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(value: string | number | undefined | null) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function assertReportSummary(summary: ReportSummary) {
  if (!summary || typeof summary !== 'object') {
    throw new Error('REPORT_SUMMARY_INVALID');
  }

  const numericFields = [
    summary.entriesValueCents,
    summary.exitsValueCents,
    summary.estimatedProfitCents ?? 0,
    summary.movedProductsCount,
  ];

  if (!numericFields.every((value) => Number.isFinite(value))) {
    throw new Error('REPORT_SUMMARY_INVALID');
  }

  if (!Array.isArray(summary.topProductsByQuantity)) {
    throw new Error('REPORT_SUMMARY_INVALID');
  }
}

function periodLabel(period: ReportSummary['period']) {
  switch (period) {
    case 'today':
      return 'Hoje';
    case 'week':
      return 'Ultimos 7 dias';
    case 'month':
      return 'Ultimos 30 dias';
    default:
      return 'Periodo personalizado';
  }
}

export async function exportReportCsv(summary: ReportSummary) {
  assertReportSummary(summary);

  const rows = [
    ['Relatorio EstoqueGuard Offline'],
    ['Gerado em', formatShortDateTime(nowIso())],
    ['Periodo', periodLabel(summary.period)],
    ['Moeda', summary.currency],
    [],
    ['Entradas', formatMoney(summary.entriesValueCents, summary.currency)],
    ['Saidas', formatMoney(summary.exitsValueCents, summary.currency)],
    ['Lucro estimado', formatMoney(summary.estimatedProfitCents ?? 0, summary.currency)],
    ['Produtos movimentados', summary.movedProductsCount],
    [],
    ['Produto', 'Quantidade movimentada'],
    ...summary.topProductsByQuantity.map((product) => [product.productName, product.quantity]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
  const fileName = `estoqueguard-relatorio-${nowIso().replace(/[:.]/g, '-')}.csv`;
  const fileUri = `${await ensureExportFolder()}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, csv);
  await createAuditLog({
    action: 'data_exported',
    entityType: 'report',
    entityId: summary.period,
    metadataJson: JSON.stringify({ format: 'csv', fileName, fileUri }),
  });
  await shareIfAvailable(fileUri);
  return fileUri;
}

export async function exportReportPdf(summary: ReportSummary) {
  assertReportSummary(summary);

  const generatedAt = nowIso();
  const fileName = `estoqueguard-relatorio-${generatedAt.replace(/[:.]/g, '-')}.pdf`;
  const rows = summary.topProductsByQuantity
    .map(
      (product, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(product.productName)}</td>
          <td class="number">${escapeHtml(product.quantity)}</td>
        </tr>
      `,
    )
    .join('');
  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @page { margin: 28px; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #101418;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
            background: #F7F8FA;
          }
          .page {
            padding: 28px;
            background: #FFFFFF;
            border: 1px solid #C8D0DC;
            border-radius: 18px;
          }
          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            padding-bottom: 18px;
            border-bottom: 2px solid #005FCC;
          }
          .brand {
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #005FCC;
          }
          h1 {
            margin: 8px 0 4px;
            font-size: 28px;
            line-height: 1.15;
          }
          .muted {
            color: #48515C;
            font-size: 13px;
            line-height: 1.5;
          }
          .pill {
            display: inline-block;
            border: 1px solid #005FCC;
            border-radius: 999px;
            padding: 8px 12px;
            color: #101418;
            background: #E9EDF3;
            font-size: 12px;
            font-weight: 800;
            white-space: nowrap;
          }
          .metrics {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin: 22px 0;
          }
          .metric {
            border: 1px solid #C8D0DC;
            border-radius: 14px;
            padding: 14px;
            background: #FFFFFF;
          }
          .metric-label {
            margin-bottom: 6px;
            color: #48515C;
            font-size: 12px;
            font-weight: 700;
          }
          .metric-value {
            font-size: 20px;
            font-weight: 900;
          }
          h2 {
            margin: 24px 0 10px;
            font-size: 18px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
            border: 1px solid #DDE6D2;
            border-radius: 12px;
          }
          th, td {
            padding: 11px 12px;
            border-bottom: 1px solid #E7EEDC;
            text-align: left;
            font-size: 13px;
          }
          th {
            color: #101418;
            background: #E9EDF3;
            font-size: 12px;
            text-transform: uppercase;
          }
          tr:last-child td { border-bottom: none; }
          .number { text-align: right; font-weight: 800; }
          .empty {
            padding: 18px;
            color: #48515C;
            border: 1px dashed #C8D0DC;
            border-radius: 12px;
            background: #FFFFFF;
          }
          .footer {
            margin-top: 24px;
            padding-top: 14px;
            border-top: 1px solid #C8D0DC;
          }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="header">
            <div>
              <div class="brand">EstoqueGuard Offline</div>
              <h1>Relatorio de estoque</h1>
              <div class="muted">Gerado em ${escapeHtml(formatShortDateTime(generatedAt))}</div>
            </div>
            <div class="pill">${escapeHtml(periodLabel(summary.period))}</div>
          </section>

          <section class="metrics">
            <div class="metric">
              <div class="metric-label">Entradas</div>
              <div class="metric-value">${escapeHtml(formatMoney(summary.entriesValueCents, summary.currency))}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Saidas</div>
              <div class="metric-value">${escapeHtml(formatMoney(summary.exitsValueCents, summary.currency))}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Lucro estimado</div>
              <div class="metric-value">${escapeHtml(formatMoney(summary.estimatedProfitCents ?? 0, summary.currency))}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Produtos movimentados</div>
              <div class="metric-value">${escapeHtml(summary.movedProductsCount)}</div>
            </div>
          </section>

          <section>
            <h2>Principais produtos</h2>
            ${
              rows
                ? `<table>
                    <thead>
                      <tr><th>#</th><th>Produto</th><th class="number">Quantidade</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                  </table>`
                : '<div class="empty">Sem dados no periodo.</div>'
            }
          </section>

          <section class="footer muted">
            Relatorio gerado localmente. Nenhum dado foi enviado para servidores externos.
          </section>
        </main>
      </body>
    </html>
  `;
  const printed = await Print.printToFileAsync({ html });
  const fileUri = `${await ensureExportFolder()}${fileName}`;
  await FileSystem.copyAsync({ from: printed.uri, to: fileUri });
  await createAuditLog({
    action: 'data_exported',
    entityType: 'report',
    entityId: summary.period,
    metadataJson: JSON.stringify({ format: 'pdf', fileName, fileUri }),
  });
  await shareIfAvailable(fileUri);
  return fileUri;
}
