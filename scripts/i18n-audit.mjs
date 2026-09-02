import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const i18nPath = path.resolve('src/i18n/index.ts');
const i18nSource = fs.readFileSync(i18nPath, 'utf8');
const locales = ['pt-BR', 'en', 'es'];
const issues = [];

function sourceFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(ts|tsx)$/.test(entry.name) ? [target] : [];
  });
}

function loadEffectiveCatalog() {
  const auditExport = '\nexport { translationsWithFallback as __translationsForAudit };';
  const compiled = ts.transpileModule(i18nSource + auditExport, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: i18nPath,
  }).outputText;
  const module = { exports: {} };
  const auditRequire = (specifier) => {
    if (specifier === 'react') return { useMemo: (factory) => factory() };
    if (specifier === 'expo-localization') return { useLocales: () => [{ languageCode: 'pt' }] };
    if (specifier === '@/state/app-state') return { useAppState: () => ({}) };
    throw new Error(`Unexpected import while loading i18n catalog: ${specifier}`);
  };
  Function('require', 'module', 'exports', compiled)(auditRequire, module, module.exports);
  return module.exports.__translationsForAudit;
}

function flattenStrings(value, prefix = '', output = new Map()) {
  if (typeof value === 'string') {
    output.set(prefix, value);
    return output;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return output;
  for (const [key, child] of Object.entries(value)) {
    flattenStrings(child, prefix ? `${prefix}.${key}` : key, output);
  }
  return output;
}

function placeholders(value) {
  return [...value.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort().join(',');
}

function location(source, node) {
  const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
  return `${path.relative('.', source.fileName)}:${line + 1}:${character + 1}`;
}

const catalog = loadEffectiveCatalog();
const flattened = Object.fromEntries(locales.map((locale) => [locale, flattenStrings(catalog[locale])]));
const baseKeys = new Set(flattened['pt-BR'].keys());
const translationSections = new Set([...baseKeys].map((key) => key.split('.')[0]));

if (process.env.I18N_REPORT_SHARED === '1') {
  for (const locale of locales.slice(1)) {
    const shared = [...baseKeys].filter((key) => {
      const value = flattened['pt-BR'].get(key);
      return value === flattened[locale].get(key) && value && /[A-Za-zÀ-ÿ]{2}/.test(value);
    });
    console.log(`${locale}: ${shared.length} value(s) match pt-BR exactly:`);
    console.log(shared.map((key) => `- ${key}: ${flattened[locale].get(key)}`).join('\n'));
  }
}

for (const locale of locales.slice(1)) {
  for (const key of baseKeys) {
    if (!flattened[locale].has(key)) issues.push(`${locale} is missing translation key ${key}`);
    const baseValue = flattened['pt-BR'].get(key);
    const localizedValue = flattened[locale].get(key);
    if (baseValue && localizedValue && placeholders(baseValue) !== placeholders(localizedValue)) {
      issues.push(`${locale}.${key} uses different interpolation parameters`);
    }
  }
  for (const key of flattened[locale].keys()) {
    if (!baseKeys.has(key)) issues.push(`${locale} has an extra translation key ${key}`);
  }
}

const userFacingAttributes = new Set([
  'accessibilityHint',
  'accessibilityLabel',
  'actionLabel',
  'cancelLabel',
  'confirmLabel',
  'description',
  'emptyLabel',
  'headerTitle',
  'helperText',
  'label',
  'message',
  'placeholder',
  'searchPlaceholder',
  'subtitle',
  'title',
]);
const userFacingCalls = /^(set(?:Action|Export)?Error|setSuccess|setMessage|showMessage)$/;
const invariantLabels = new Set(['Kg', 'g', 'L', 'ml']);
const usedKeys = new Set();

for (const file of [...sourceFiles('app'), ...sourceFiles('src')]) {
  if (path.resolve(file) === i18nPath) continue;
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 't') {
      const first = node.arguments[0];
      if (first && ts.isStringLiteralLike(first)) {
        usedKeys.add(first.text);
        const requiredParams = placeholders(flattened['pt-BR'].get(first.text) ?? '').split(',').filter(Boolean);
        const paramsArgument = node.arguments[1];
        if (requiredParams.length && !paramsArgument) {
          issues.push(`${location(source, node)} calls ${first.text} without required parameters: ${requiredParams.join(', ')}`);
        } else if (requiredParams.length && paramsArgument && ts.isObjectLiteralExpression(paramsArgument)) {
          const suppliedParams = new Set(paramsArgument.properties.flatMap((property) => (
            ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)
              ? [property.name.getText(source).replace(/^['"]|['"]$/g, '')]
              : []
          )));
          const missingParams = requiredParams.filter((param) => !suppliedParams.has(param));
          if (missingParams.length) {
            issues.push(`${location(source, node)} calls ${first.text} without parameters: ${missingParams.join(', ')}`);
          }
        }
      }
    }

    if (ts.isStringLiteralLike(node) && /^[a-z][A-Za-z0-9]*\.[A-Za-z][A-Za-z0-9]*$/.test(node.text)) {
      const [section] = node.text.split('.');
      if (translationSections.has(section)) usedKeys.add(node.text);
    }

    if (ts.isJsxText(node) && /[A-Za-zÀ-ÿ]/.test(node.text)) {
      const text = node.text.trim().replace(/\s+/g, ' ');
      if (text) issues.push(`${location(source, node)} has hardcoded JSX text: ${JSON.stringify(text)}`);
    }

    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name) && userFacingAttributes.has(node.name.text)) {
      if (node.initializer && ts.isStringLiteral(node.initializer) && /[A-Za-zÀ-ÿ]/.test(node.initializer.text)) {
        issues.push(`${location(source, node)} has hardcoded ${node.name.text}: ${JSON.stringify(node.initializer.text)}`);
      }
    }

    if (
      ts.isPropertyAssignment(node)
      && ts.isIdentifier(node.name)
      && userFacingAttributes.has(node.name.text)
      && ts.isStringLiteralLike(node.initializer)
      && /[A-Za-zÀ-ÿ]/.test(node.initializer.text)
      && !invariantLabels.has(node.initializer.text)
    ) {
      issues.push(`${location(source, node)} has hardcoded ${node.name.text} option: ${JSON.stringify(node.initializer.text)}`);
    }

    if (
      ts.isCallExpression(node)
      && ts.isIdentifier(node.expression)
      && userFacingCalls.test(node.expression.text)
      && node.arguments[0]
      && ts.isStringLiteralLike(node.arguments[0])
      && /[a-zÀ-ÿ]{2}/i.test(node.arguments[0].text)
      && !/^[A-Z][A-Z0-9_]+$/.test(node.arguments[0].text)
    ) {
      issues.push(`${location(source, node.arguments[0])} passes hardcoded user-facing text to ${node.expression.text}`);
    }

    ts.forEachChild(node, visit);
  };
  visit(source);
}

for (const key of usedKeys) {
  if (!baseKeys.has(key)) issues.push(`Missing pt-BR translation key ${key}`);
}

const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const nativeLocaleKeys = ['CFBundleDisplayName', 'NSFaceIDUsageDescription', 'NSPhotoLibraryUsageDescription', 'NSUserTrackingUsageDescription'];
for (const locale of locales) {
  const localePath = appConfig.expo?.locales?.[locale];
  if (!localePath || !fs.existsSync(localePath)) {
    issues.push(`app.json is missing a valid native locale file for ${locale}`);
    continue;
  }
  const nativeLocale = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  for (const key of nativeLocaleKeys) {
    if (typeof nativeLocale.ios?.[key] !== 'string' || !nativeLocale.ios[key].trim()) {
      issues.push(`${localePath} is missing ios.${key}`);
    }
  }
  if (typeof nativeLocale.android?.app_name !== 'string' || !nativeLocale.android.app_name.trim()) {
    issues.push(`${localePath} is missing android.app_name`);
  }
}

if (issues.length) {
  console.error(`i18n audit failed with ${issues.length} issue(s):\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
  process.exit(1);
}

console.log(`i18n audit passed: ${usedKeys.size} static keys and ${baseKeys.size} catalog entries validated across ${locales.length} locales.`);
