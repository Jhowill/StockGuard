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
