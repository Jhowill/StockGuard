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

test('restore requires a safety copy before destructive database changes', () => {
  const backupService = read('src/services/backupService.ts');

  assert.match(backupService, /throw new Error\('BACKUP_SAFETY_COPY_FAILED'/);
  assert.doesNotMatch(backupService, /continue with restore validation/);
});

test('product and initial stock are created in one transaction', () => {
  const productScreen = read('app/products/new.tsx');
  const movementService = read('src/services/stockMovementService.ts');

  assert.match(productScreen, /createProductWithInitialStock/);
  assert.doesNotMatch(productScreen, /await createProduct\(/);
  assert.match(movementService, /return withTransaction\(async \(\) => \{/);
  assert.match(movementService, /await createStockMovementRecord\(/);
});

test('financial summaries never aggregate different currencies', () => {
  const reports = read('src/services/reportService.ts');
  const dashboard = read('src/hooks/useDashboard.ts');

  assert.match(reports, /movement\.currency === currency/);
  assert.match(reports, /movement\.unitCostCents/);
  assert.match(reports, /listMovements\(0\)/);
  assert.match(reports, /revenue - cost/);
  assert.doesNotMatch(reports, /exitsValueCents - entriesValueCents/);
  assert.match(dashboard, /product\.currency === currency/);
});

test('stock balances are normalized to the supported decimal precision', () => {
  const movementService = read('src/services/stockMovementService.ts');

  assert.match(movementService, /Math\.round\(result \* 1000\) \/ 1000/);
});

test('PIN and biometric updates cannot leave the app locked without a credential', () => {
  const pinScreen = read('app/security/pin.tsx');
  const biometricScreen = read('app/security/biometric.tsx');
  const securityService = read('src/services/securityService.ts');

  assert.match(pinScreen, /setPinWithRollback/);
  assert.match(pinScreen, /saveSettings\(\{ appLockEnabled: false, biometricUnlockEnabled: false \}\);\s+await clearPin\(\)/);
  assert.match(securityService, /previousHash/);
  assert.match(biometricScreen, /await disableBiometricLock\(\);\s+throw saveError/);
});

test('product expiration dates are calendar-valid before persistence and restore', () => {
  const repository = read('src/database/repositories/productRepository.ts');
  const backupService = read('src/services/backupService.ts');

  assert.match(repository, /isValidIsoDate\(record\.expirationDate\)/);
  assert.match(backupService, /isValidIsoDate\(product\.expirationDate\)/);
});

test('new product keeps the requested compact and modal selection layout', () => {
  const product = read('app/products/new.tsx');
  const modalSelect = read('src/components/ui/AppModalSelect.tsx');
  const input = read('src/components/ui/AppInput.tsx');

  assert.match(product, /descriptionPlaceholder/);
  assert.match(product, /<AppModalSelect/);
  assert.match(product, /QuickCreateRelation/);
  assert.match(product, /inputSize="large"/);
  assert.match(modalSelect, /accessibilityState=\{\{ checked: selected \}\}/);
  assert.match(input, /formatMoneyInput\(text\)/);
});

test('navigation and inventory refinements remain consistent', () => {
  const header = read('src/components/ui/AppHeader.tsx');
  const settings = read('app/(tabs)/settings.tsx');
  const editProduct = read('app/products/edit.tsx');
  const products = read('app/(tabs)/products.tsx');
  const alertsHook = read('src/hooks/useAlerts.ts');
  const home = read('app/(tabs)/index.tsx');

  assert.match(header, /actionIcon\?: keyof typeof Ionicons\.glyphMap/);
  assert.match(header, /resolvedActionIcon \?/);
  assert.match(settings, /router\.push\('\/categories'\)/);
  assert.match(settings, /router\.push\('\/suppliers'\)/);
  assert.match(editProduct, /const dirty = Boolean\(initialSignature && currentSignature !== initialSignature\)/);
  assert.match(editProduct, /visible=\{confirmExit\}/);
  assert.match(products, /settings\?\.expirationWarningDays \?\? 7/);
  assert.match(alertsHook, /getExpiringProducts\(settings\.expirationWarningDays\)/);
  assert.match(home, /movement\.adjustmentNegative/);
});

test('new product save has one guarded persistence flow', () => {
  const product = read('app/products/new.tsx');

  assert.match(product, /accessibilityState=\{\{ disabled: !canSave, busy: loading \}\}/);
  assert.match(product, /disabled=\{!canSave\}/);
  assert.match(product, /router\.replace\(\{ pathname: '\/products\/\[id\]', params: \{ id: product\.id \} \}\)/);
  assert.match(product, /setError\(getProductCreateErrorMessage\(err, t\)\)/);
});
