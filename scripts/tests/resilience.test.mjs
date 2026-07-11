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
  assert.match(state, /initializationRequestRef/);
  assert.match(state, /requestId !== initializationRequestRef\.current/);
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
  assert.match(securityService, /Keep the original failure/);
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

test('tab data refreshes on focus and Home supports pull to refresh', () => {
  const container = read('src/components/ui/ScreenContainer.tsx');
  const home = read('app/(tabs)/index.tsx');

  assert.match(container, /RefreshControl/);
  assert.match(container, /refreshControl=\{onRefresh/);
  assert.match(home, /onRefresh=\{\(\) => void refresh\(\)\}/);
  assert.match(read('src/hooks/useProducts.ts'), /useFocusEffect/);
  assert.match(read('src/hooks/useAlerts.ts'), /useFocusEffect/);
});

test('large backup files are rejected before reading and migrations preserve root errors', () => {
  const backupService = read('src/services/backupService.ts');
  const database = read('src/database/db.ts');

  assert.match(backupService, /MAX_BACKUP_FILE_BYTES = 20 \* 1024 \* 1024/);
  assert.match(backupService, /fileSize > MAX_BACKUP_FILE_BYTES/);
  assert.ok(backupService.indexOf('getInfoAsync(fileUri)') < backupService.indexOf('readAsStringAsync(fileUri)'));
  assert.match(database, /try \{\s+await db\.execAsync\('ROLLBACK'\);\s+\} catch \{/);
});

test('focused data hooks ignore stale async responses', () => {
  for (const file of [
    'src/hooks/useProducts.ts',
    'src/hooks/useDashboard.ts',
    'src/hooks/useAlerts.ts',
    'src/hooks/useReports.ts',
    'src/hooks/useProductDetail.ts',
  ]) {
    const source = read(file);
    assert.match(source, /requestIdRef/);
    assert.match(source, /requestId === requestIdRef\.current/);
  }
});

test('Home value privacy and per-unit pricing remain wired', () => {
  const home = read('app/(tabs)/index.tsx');
  const newProduct = read('app/products/new.tsx');
  const editProduct = read('app/products/edit.tsx');
  const i18n = read('src/i18n/index.ts');

  assert.match(home, /toggleFinancialValues/);
  assert.match(home, /updateSettings\(\{ hideFinancialValues: nextHidden \}\)/);
  assert.match(home, /hideFinancialValues \? '••••••'/);
  assert.match(newProduct, /productNew\.perUnit/);
  assert.match(editProduct, /productNew\.perUnit/);
  assert.match(i18n, /perUnit: 'Valor por unidade'/);
  assert.match(i18n, /showValues: 'Show financial values'/);
  assert.match(i18n, /showValues: 'Mostrar valores financieros'/);
});

test('SQLite uses defensive connection settings and exposes a full health check', () => {
  const database = read('src/database/db.ts');

  assert.match(database, /PRAGMA foreign_keys = ON/);
  assert.match(database, /PRAGMA busy_timeout = 5000/);
  assert.match(database, /PRAGMA journal_mode = WAL/);
  assert.match(database, /PRAGMA quick_check\(1\)/);
  assert.match(database, /export async function getDatabaseHealth/);
  assert.match(database, /PRAGMA integrity_check/);
  assert.match(database, /PRAGMA foreign_key_check/);
  assert.match(database, /transactionQueue/);
  assert.match(database, /await previous\.catch/);
});

test('backup restore rejects oversized collections and duplicate identifiers', () => {
  const backup = read('src/services/backupService.ts');

  assert.match(backup, /MAX_BACKUP_RECORDS = 100_000/);
  assert.match(backup, /assertUniqueIds\(categories/);
  assert.match(backup, /assertUniqueIds\(suppliers/);
  assert.match(backup, /assertUniqueIds\(products/);
  assert.match(backup, /assertUniqueIds\(movements/);
  assert.match(backup, /INPUT_LIMITS\.description/);
  assert.match(backup, /INPUT_LIMITS\.notes/);
});

test('critical writes enforce domain limits and movement serialization', () => {
  const products = read('src/database/repositories/productRepository.ts');
  const categories = read('src/database/repositories/categoryRepository.ts');
  const suppliers = read('src/database/repositories/supplierRepository.ts');
  const movements = read('src/services/stockMovementService.ts');

  assert.match(products, /validateProductText\(product\)/);
  assert.match(products, /validateProductText\(next\)/);
  assert.match(categories, /INVALID_CATEGORY_SORT_ORDER/);
  assert.match(suppliers, /assertUniqueSupplierName/);
  assert.match(suppliers, /validateSupplierText/);
  assert.match(movements, /withProductMovementLock/);
  assert.match(movements, /productMovementQueues/);
  assert.match(movements, /isValidStockQuantity/);
  assert.match(movements, /INVALID_MOVEMENT_TOTAL/);
  assert.match(products, /isValidMoneyCents/);
});

test('render failures are contained by the root error boundary', () => {
  const layout = read('app/_layout.tsx');
  const boundary = read('src/components/ui/AppErrorBoundary.tsx');

  assert.match(layout, /<AppErrorBoundary>/);
  assert.match(boundary, /getDerivedStateFromError/);
  assert.match(boundary, /componentDidCatch/);
  assert.match(boundary, /router\.replace\('\/'\)/);
});

test('audit metadata excludes product names and local backup paths', () => {
  const products = read('src/database/repositories/productRepository.ts');
  const backup = read('src/services/backupService.ts');

  assert.doesNotMatch(products, /metadataJson: JSON\.stringify\(\{ name:/);
  assert.doesNotMatch(backup, /metadataJson: JSON\.stringify\(\{ fileUri/);
});
