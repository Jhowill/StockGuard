import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const i18nPath = path.resolve('src/i18n/index.ts');
const i18nSource = fs.readFileSync(i18nPath, 'utf8');
const sourceFile = ts.createSourceFile(i18nPath, i18nSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
let baseCatalog;

function propertyName(node) {
  return ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node) ? node.text : undefined;
}

function findBaseCatalog(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'translations' && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
    const locale = node.initializer.properties.find((property) => ts.isPropertyAssignment(property) && propertyName(property.name) === 'pt-BR');
    if (locale && ts.isPropertyAssignment(locale) && ts.isObjectLiteralExpression(locale.initializer)) baseCatalog = locale.initializer;
  }
  ts.forEachChild(node, findBaseCatalog);
}
findBaseCatalog(sourceFile);

if (!baseCatalog) {
  console.error('Could not locate the pt-BR base catalog.');
  process.exit(1);
}

const catalogKeys = new Set();
function collectCatalogKeys(object, prefix = '') {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = propertyName(property.name);
    if (!name) continue;
    const key = prefix ? `${prefix}.${name}` : name;
    if (ts.isObjectLiteralExpression(property.initializer)) collectCatalogKeys(property.initializer, key);
    else if (ts.isStringLiteralLike(property.initializer) || ts.isNoSubstitutionTemplateLiteral(property.initializer)) catalogKeys.add(key);
  }
}
collectCatalogKeys(baseCatalog);

function sourceFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(ts|tsx)$/.test(entry.name) ? [target] : [];
  });
}

const usedKeys = new Set();
for (const file of [...sourceFiles('app'), ...sourceFiles('src')]) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 't') {
      const first = node.arguments[0];
      if (first && ts.isStringLiteralLike(first)) usedKeys.add(first.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

const missing = [...usedKeys].filter((key) => !catalogKeys.has(key)).sort();
if (missing.length) {
  console.error(`Missing pt-BR translation keys:\n${missing.map((key) => `- ${key}`).join('\n')}`);
  process.exit(1);
}

console.log(`i18n audit passed: ${usedKeys.size} static keys validated.`);
