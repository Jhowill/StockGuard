import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('SQLite initialization failures can be retried safely', () => {
  const db = read('src/database/db.ts');
  const state = read('src/state/app-state.tsx');
  const layout = read('app/_layout.tsx');

  assert.match(db, /dbPromise = initializeDatabase\(\)\.catch/);
  assert.match(db, /dbPromise = null/);
  assert.match(state, /initializationError/);
  assert.match(state, /retryInitialization/);
  assert.match(layout, /onActionPress=\{\(\) => void retryInitialization\(\)\}/);
});

test('PDF exports keep the selected locale in HTML and number/date formatting', () => {
  const exportService = read('src/services/exportService.ts');
  const reportsScreen = read('app/(tabs)/reports.tsx');

  assert.match(exportService, /<html lang="\$\{escapeHtml\(locale\)\}">/);
  assert.match(exportService, /formatShortDateTime\(generatedAt, locale\)/);
  assert.match(exportService, /formatMoney\(summary\.entriesValueCents, summary\.currency, locale\)/);
  assert.match(reportsScreen, /exportReportPdf\(summary, exportCopy, language\)/);
  assert.match(reportsScreen, /exportReportCsv\(summary, exportCopy, language\)/);
});

test('legal documents and release checklist remain wired into the app', () => {
  const settings = read('app/(tabs)/settings.tsx');
  const checklist = read('docs/07_RELEASE_CHECKLIST.md');

  assert.match(settings, /PRIVACY_POLICY_URL/);
  assert.match(settings, /TERMS_URL/);
  assert.match(settings, /showPrivacyOptions/);
  assert.match(checklist, /Google Play/);
  assert.match(checklist, /App Store/);
  assert.match(checklist, /Data Safety/);
});

test('visible actions lead only to implemented features', () => {
  const premium = read('app/premium.tsx');
  const movement = read('app/products/movement.tsx');
  const reports = read('app/(tabs)/reports.tsx');
  const alerts = read('app/(tabs)/alerts.tsx');

  assert.doesNotMatch(premium, /key: 'barcode_scanner'|key: 'profit_analysis'|key: 'advanced_history'|key: 'unlimited_categories'|key: 'batch_expiration_control'/);
  assert.doesNotMatch(premium, /grantTemporaryAdFree|temporaryAdFree/);
  assert.doesNotMatch(movement, /rightAction=/);
  assert.doesNotMatch(reports, /rightAction=/);
  assert.doesNotMatch(alerts, /rightAction=/);
});

test('preference reset clears native security secrets and external links are validated', () => {
  const settings = read('app/(tabs)/settings.tsx');

  assert.match(settings, /await clearSecuritySecrets\(\)/);
  assert.match(settings, /await Linking\.canOpenURL\(url\)/);
});

test('internal movement reason codes are localized before display', () => {
  const detail = read('app/products/[id].tsx');

  assert.match(detail, /getMovementReasonLabel\(movement\.reason, t\)/);
  assert.doesNotMatch(detail, /title=\{movement\.reason\}/);
});

test('backup history does not expose internal record types', () => {
  const backup = read('app/backup.tsx');

  assert.match(backup, /formatBackupType\(backup\.type\)/);
  assert.doesNotMatch(backup, /backup\.fileName \?\? backup\.type/);
});
