# 05 — Data Model

## App

**EstoqueGuard Offline**

## Objetivo deste documento

Este documento define o modelo de dados, regras de persistência, entidades, relacionamentos, migrations, validações e políticas de segurança local do app **EstoqueGuard Offline**.

O objetivo é garantir que o app seja implementado com uma arquitetura offline robusta, segura, escalável e preparada para:

- cadastro de produtos;
- controle de entradas e saídas;
- histórico de movimentações;
- categorias;
- fornecedores;
- alertas;
- relatórios;
- tema claro/escuro;
- vários idiomas;
- anúncios premiados;
- desbloqueio temporário de recursos;
- backup local;
- criptografia do banco;
- auditoria de alterações críticas.

---

# 1. Princípios do modelo de dados

## 1.1. Regra principal

O app deve ser **offline-first**.

```txt
O banco local é a fonte principal de verdade.
O app deve abrir, cadastrar, consultar e movimentar estoque sem internet.
Internet só deve ser necessária para anúncios, consentimento de anúncios e futuras integrações.
```

## 1.2. Fonte única de verdade

A quantidade atual de um produto deve ficar em `products.quantity`, mas toda alteração de quantidade deve obrigatoriamente gerar um registro em `stock_movements`.

```txt
products.quantity = estado atual
stock_movements = histórico/auditoria da mudança
```

Nunca alterar estoque diretamente sem registrar movimentação.

## 1.3. Separação obrigatória

As telas não devem acessar SQLite diretamente.

Fluxo correto:

```txt
Tela
→ hook
→ service
→ repository
→ database
```

Exemplo:

```txt
app/products/[id].tsx
→ useProductDetail(productId)
→ productService.getProductDetail(productId)
→ productRepository.findById(productId)
→ SQLite
```

## 1.4. Nada sensível hardcoded

Não salvar no código:

- chave do banco;
- senha de backup;
- identificadores privados de produção;
- chaves de SDK;
- dados reais de teste;
- credenciais;
- strings de segurança.

## 1.5. Dados financeiros

Valores monetários devem ser salvos em centavos, como número inteiro.

```txt
R$ 10,90 → 1090
US$ 5.99 → 599
```

Evitar `float` para dinheiro.

---

# 2. Banco local

## 2.1. Tecnologia recomendada

```txt
SQLite local
SQLCipher para criptografia
Expo SecureStore para guardar chave do banco
Migrations versionadas
Repositories por domínio
```

## 2.2. Nome sugerido do banco

```txt
estoqueguard.db
```

## 2.3. Tabelas principais

```txt
products
categories
suppliers
stock_movements
app_settings
ad_entitlements
feature_usage_limits
audit_logs
backup_records
schema_migrations
```

## 2.4. Tabelas futuras

```txt
customers
locations
product_batches
barcode_cache
report_presets
purchase_orders
sales_records
```

Essas tabelas devem ficar fora da V1 se não forem essenciais.

---

# 3. Tipos globais

## 3.1. ID

Todos os registros devem usar `string` como ID.

```ts
type EntityId = string;
```

Recomendação:

```txt
UUID v4
```

## 3.2. Datas

Todas as datas devem ser ISO string.

```ts
type ISODateString = string;
```

Exemplo:

```txt
2026-07-09T12:30:00.000Z
```

## 3.3. Dinheiro

```ts
type MoneyInCents = number;
```

## 3.4. Status base

```ts
type EntityStatus = 'active' | 'archived' | 'deleted';
```

Regra:

- `active`: aparece normalmente;
- `archived`: não aparece nas listas principais, mas preserva histórico;
- `deleted`: uso restrito para exclusão lógica em casos específicos.

---

# 4. Product

## 4.1. Objetivo

Representa um item controlado no estoque.

O produto pode ser uma unidade física, pacote, caixa, item técnico, peça, material de consumo ou produto de venda.

## 4.2. TypeScript

```ts
type ProductUnit =
  | 'unit'
  | 'kg'
  | 'g'
  | 'l'
  | 'ml'
  | 'm'
  | 'cm'
  | 'box'
  | 'pack'
  | 'pair'
  | 'service_item';

type ProductStatus = 'active' | 'archived';

type Product = {
  id: string;

  name: string;
  description?: string;
  sku?: string;
  barcode?: string;

  categoryId?: string;
  supplierId?: string;

  quantity: number;
  minQuantity: number;
  unit: ProductUnit;

  costPriceCents?: number;
  salePriceCents?: number;
  currency: CurrencyCode;

  expirationDate?: string;
  batchCode?: string;
  location?: string;

  imageUri?: string;
  notes?: string;

  status: ProductStatus;

  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};
```

## 4.3. Campos obrigatórios na V1

```txt
id
name
quantity
minQuantity
unit
currency
status
createdAt
updatedAt
```

## 4.4. Campos opcionais na V1

```txt
description
sku
barcode
categoryId
supplierId
costPriceCents
salePriceCents
expirationDate
batchCode
location
imageUri
notes
archivedAt
```

## 4.5. Regras funcionais

- `name` não pode ficar vazio.
- `quantity` não pode ser negativa, exceto se uma configuração futura permitir estoque negativo.
- `minQuantity` não pode ser negativa.
- `costPriceCents` não pode ser negativo.
- `salePriceCents` não pode ser negativo.
- `barcode`, se existir, deve ser único entre produtos ativos.
- `sku`, se existir, deve ser único entre produtos ativos.
- Produto com histórico não deve ser excluído fisicamente na V1.
- Produto arquivado não aparece na lista principal.
- Produto arquivado continua visível em relatórios e histórico.

## 4.6. Regras de alerta

```ts
type ProductStockStatus = 'ok' | 'low' | 'zero' | 'expired' | 'expiring_soon';
```

Regras:

```txt
quantity === 0 → zero
quantity > 0 && quantity <= minQuantity → low
expirationDate < today → expired
expirationDate entre hoje e próximos X dias → expiring_soon
caso contrário → ok
```

O número de dias para vencimento próximo deve vir de `app_settings.expirationWarningDays`.

---

# 5. Category

## 5.1. Objetivo

Organiza produtos por grupo.

Exemplos:

- Bebidas;
- Peças;
- Ferramentas;
- Cosméticos;
- Alimentos;
- Materiais de limpeza;
- Eletrônicos;
- Serviços;
- Outros.

## 5.2. TypeScript

```ts
type Category = {
  id: string;
  name: string;
  colorToken?: string;
  iconName?: string;
  sortOrder: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
};
```

## 5.3. Regras funcionais

- `name` não pode ficar vazio.
- Nomes duplicados devem ser evitados entre categorias ativas.
- Categoria com produtos vinculados não deve ser excluída fisicamente.
- Ao arquivar categoria, produtos vinculados podem ficar sem categoria ou manter referência arquivada.
- A V1 deve permitir categoria `Sem categoria` como fallback visual, sem necessariamente criar registro real.

## 5.4. Limite por anúncios/premium

Na versão gratuita, o app pode limitar categorias avançadas.

Exemplo:

```txt
Grátis: até 5 categorias personalizadas
Rewarded Interstitial: libera categorias ilimitadas por 24h
Premium futuro: categorias ilimitadas permanentes
```

Essa regra deve ser controlada por `feature gates`, não dentro da tela.

---

# 6. Supplier

## 6.1. Objetivo

Representa fornecedores associados aos produtos.

## 6.2. TypeScript

```ts
type Supplier = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  document?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
};
```

## 6.3. Regras funcionais

- `name` é obrigatório.
- `email`, se informado, deve ter formato válido.
- `phone`, se informado, deve aceitar formato flexível por país.
- `document` não deve ter validação rígida na V1, por causa de internacionalização.
- Fornecedor com produtos vinculados deve ser arquivado, não excluído fisicamente.

---

# 7. StockMovement

## 7.1. Objetivo

Registra qualquer alteração de estoque.

Essa entidade é crítica para segurança, auditoria e relatórios.

## 7.2. TypeScript

```ts
type StockMovementType =
  | 'in'
  | 'out'
  | 'loss'
  | 'return'
  | 'adjustment_positive'
  | 'adjustment_negative'
  | 'initial_balance';

type StockMovementReason =
  | 'purchase'
  | 'sale'
  | 'service_use'
  | 'loss'
  | 'damage'
  | 'expired'
  | 'manual_adjustment'
  | 'customer_return'
  | 'supplier_return'
  | 'initial_setup'
  | 'other';

type StockMovement = {
  id: string;
  productId: string;

  type: StockMovementType;
  reason: StockMovementReason;

  quantity: number;
  previousQuantity: number;
  newQuantity: number;

  unitCostCents?: number;
  unitSalePriceCents?: number;
  totalCostCents?: number;
  totalSaleCents?: number;
  currency: CurrencyCode;

  note?: string;

  createdAt: string;
};
```

## 7.3. Regras funcionais

- Toda entrada/saída deve criar uma movimentação.
- `quantity` deve ser maior que zero.
- `previousQuantity` deve refletir o valor antes da operação.
- `newQuantity` deve refletir o valor depois da operação.
- Não permitir saída maior que o estoque atual, salvo se configuração futura permitir estoque negativo.
- Movimentação não deve ser editada na V1.
- Correção deve ser feita por nova movimentação de ajuste.
- Movimentação não deve ser excluída na V1.

## 7.4. Cálculo de nova quantidade

```ts
function calculateNewQuantity(
  previousQuantity: number,
  movementType: StockMovementType,
  quantity: number
): number {
  if (movementType === 'in') return previousQuantity + quantity;
  if (movementType === 'return') return previousQuantity + quantity;
  if (movementType === 'adjustment_positive') return previousQuantity + quantity;
  if (movementType === 'out') return previousQuantity - quantity;
  if (movementType === 'loss') return previousQuantity - quantity;
  if (movementType === 'adjustment_negative') return previousQuantity - quantity;
  if (movementType === 'initial_balance') return quantity;
  return previousQuantity;
}
```

## 7.5. Transação obrigatória

Toda movimentação deve ser salva dentro de transação.

Fluxo obrigatório:

```txt
1. buscar produto
2. validar quantidade
3. calcular nova quantidade
4. atualizar products.quantity
5. inserir stock_movements
6. inserir audit_logs
7. confirmar transação
```

Se qualquer etapa falhar, nenhuma alteração deve ser persistida.

---

# 8. AppSettings

## 8.1. Objetivo

Guarda preferências gerais do app.

## 8.2. TypeScript

```ts
type ThemeMode = 'system' | 'light' | 'dark';

type SupportedLanguage = 'system' | 'pt-BR' | 'en' | 'es';

type CurrencyCode = 'BRL' | 'USD' | 'EUR';

type AppSettings = {
  id: 'default';

  theme: ThemeMode;
  language: SupportedLanguage;
  currency: CurrencyCode;

  appLockEnabled: boolean;
  biometricUnlockEnabled: boolean;
  hideFinancialValues: boolean;

  adsEnabled: boolean;
  personalizedAdsConsent?: 'unknown' | 'granted' | 'denied';

  expirationWarningDays: number;
  lowStockWarningEnabled: boolean;
  expirationWarningEnabled: boolean;

  backupReminderEnabled: boolean;
  lastBackupAt?: string;

  createdAt: string;
  updatedAt: string;
};
```

## 8.3. Valores padrão

```ts
const defaultAppSettings: AppSettings = {
  id: 'default',
  theme: 'system',
  language: 'system',
  currency: 'BRL',
  appLockEnabled: false,
  biometricUnlockEnabled: false,
  hideFinancialValues: false,
  adsEnabled: true,
  personalizedAdsConsent: 'unknown',
  expirationWarningDays: 7,
  lowStockWarningEnabled: true,
  expirationWarningEnabled: true,
  backupReminderEnabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

## 8.4. Regras funcionais

- Sempre deve existir exatamente um registro de configuração.
- Se não existir, criar com valores padrão.
- `theme` controla todo o app.
- `language` controla todos os textos.
- `currency` define o formato monetário padrão.
- `adsEnabled` pode ficar temporariamente falso por recompensa de anúncio.

---

# 9. AdEntitlement

## 9.1. Objetivo

Guarda recompensas temporárias liberadas por anúncios.

Essa entidade não representa compra real. Ela apenas controla benefícios temporários concedidos por anúncios premiados.

## 9.2. TypeScript

```ts
type AdEntitlementType =
  | 'temporary_ad_free'
  | 'temporary_feature_unlock'
  | 'usage_feature_unlock';

type AdSource = 'rewarded_ad' | 'rewarded_interstitial';

type PremiumFeature =
  | 'advanced_pdf_reports'
  | 'csv_export'
  | 'barcode_scanner'
  | 'encrypted_backup'
  | 'profit_analysis'
  | 'advanced_history'
  | 'unlimited_categories'
  | 'batch_expiration_control';

type AdEntitlement = {
  id: string;
  type: AdEntitlementType;
  source: AdSource;

  featureKey?: PremiumFeature;

  startedAt: string;
  expiresAt?: string;
  remainingUses?: number;

  dailyUseDate: string;
  dailyUseCount: number;

  status: 'active' | 'expired' | 'consumed' | 'revoked';

  createdAt: string;
  updatedAt: string;
};
```

## 9.3. Recompensa 1 — remover anúncios temporariamente

```txt
Tipo: temporary_ad_free
Fonte: rewarded_ad
Duração padrão: 1 hora
Acúmulo máximo: 3 horas
Limite diário: 5 usos
```

## 9.4. Recompensa 2 — liberar função temporariamente

```txt
Tipo: temporary_feature_unlock ou usage_feature_unlock
Fonte: rewarded_interstitial
Duração padrão: 24 horas ou quantidade limitada de usos
Limite diário: definido por recurso
```

## 9.5. Regras funcionais

- Não desbloquear recurso sem confirmação de anúncio concluído.
- Não liberar recompensa se o anúncio for cancelado.
- Não liberar recompensa se o carregamento falhar.
- Não bloquear função básica se o anúncio falhar.
- Recompensa expirada deve ser ignorada.
- Recompensa expirada pode ser marcada como `expired` em limpeza periódica.
- Recompensas temporárias não devem ser tratadas como premium vitalício.

---

# 10. FeatureUsageLimit

## 10.1. Objetivo

Controla limites diários ou mensais de recursos que podem ser liberados por anúncios.

## 10.2. TypeScript

```ts
type FeatureUsageLimit = {
  id: string;
  featureKey: PremiumFeature;

  dateKey: string;
  period: 'daily' | 'monthly';

  usedCount: number;
  freeLimit: number;
  rewardedLimit: number;

  createdAt: string;
  updatedAt: string;
};
```

## 10.3. Exemplo de uso

```txt
barcode_scanner
freeLimit: 5 leituras por dia
rewardedLimit: +10 leituras após anúncio premiado
```

## 10.4. Regras funcionais

- Limite deve ser calculado por data local do usuário.
- Alteração manual de horário do dispositivo não deve quebrar o app.
- Em caso de inconsistência, app deve preferir funcionamento básico e não crashar.
- Limite não deve impedir acesso a dados do usuário.

---

# 11. AuditLog

## 11.1. Objetivo

Registra eventos críticos para segurança e depuração local.

## 11.2. TypeScript

```ts
type AuditAction =
  | 'product_created'
  | 'product_updated'
  | 'product_archived'
  | 'stock_movement_created'
  | 'category_created'
  | 'category_updated'
  | 'supplier_created'
  | 'supplier_updated'
  | 'settings_updated'
  | 'backup_created'
  | 'backup_restored'
  | 'app_lock_enabled'
  | 'app_lock_disabled'
  | 'ad_reward_granted'
  | 'feature_unlocked_by_ad'
  | 'data_exported'
  | 'all_data_deleted';

type AuditLog = {
  id: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;

  metadataJson?: string;

  createdAt: string;
};
```

## 11.3. Regras funcionais

- Registrar alterações críticas.
- Não salvar dados sensíveis demais em `metadataJson`.
- Não salvar PIN, senha, chave, token ou dados de pagamento.
- AuditLog pode ser exportado no backup.
- AuditLog não precisa aparecer para o usuário na V1.

---

# 12. BackupRecord

## 12.1. Objetivo

Registra backups criados ou restaurados.

## 12.2. TypeScript

```ts
type BackupRecord = {
  id: string;

  type: 'export' | 'import';
  format: 'json' | 'csv' | 'encrypted_json';

  fileName?: string;
  fileSizeBytes?: number;

  encrypted: boolean;
  status: 'success' | 'failed';
  errorMessage?: string;

  createdAt: string;
};
```

## 12.3. Regras funcionais

- Backup simples pode ser JSON.
- Backup seguro deve ser criptografado.
- Importação deve validar schema antes de alterar banco.
- Restauração deve criar registro em `audit_logs`.
- Se importação falhar, banco atual não pode ser corrompido.

---

# 13. SchemaMigration

## 13.1. Objetivo

Controla versões do banco local.

## 13.2. TypeScript

```ts
type SchemaMigration = {
  id: string;
  version: number;
  name: string;
  appliedAt: string;
};
```

## 13.3. Regras funcionais

- Toda alteração de schema deve ter migration.
- Migration deve ser idempotente quando possível.
- Migration não pode apagar dados sem confirmação clara.
- App deve verificar migrations ao iniciar.
- Se migration falhar, app deve mostrar erro seguro e não corromper dados.

---

# 14. Relacionamentos

## 14.1. Product → Category

```txt
products.categoryId → categories.id
```

Relação opcional.

Um produto pode existir sem categoria.

## 14.2. Product → Supplier

```txt
products.supplierId → suppliers.id
```

Relação opcional.

Um produto pode existir sem fornecedor.

## 14.3. StockMovement → Product

```txt
stock_movements.productId → products.id
```

Relação obrigatória.

Toda movimentação precisa pertencer a um produto.

## 14.4. AdEntitlement → PremiumFeature

```txt
ad_entitlements.featureKey → feature gates internos
```

Não é chave estrangeira de tabela. É enum de sistema.

---

# 15. SQL inicial sugerido

## 15.1. products

```sql
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  barcode TEXT,
  category_id TEXT,
  supplier_id TEXT,
  quantity REAL NOT NULL DEFAULT 0,
  min_quantity REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  cost_price_cents INTEGER,
  sale_price_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'BRL',
  expiration_date TEXT,
  batch_code TEXT,
  location TEXT,
  image_uri TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
```

## 15.2. Índices de products

```sql
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_expiration_date ON products(expiration_date);
```

## 15.3. categories

```sql
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color_token TEXT,
  icon_name TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 15.4. suppliers

```sql
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  document TEXT,
  address TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 15.5. stock_movements

```sql
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY NOT NULL,
  product_id TEXT NOT NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  quantity REAL NOT NULL,
  previous_quantity REAL NOT NULL,
  new_quantity REAL NOT NULL,
  unit_cost_cents INTEGER,
  unit_sale_price_cents INTEGER,
  total_cost_cents INTEGER,
  total_sale_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'BRL',
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## 15.6. Índices de stock_movements

```sql
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);
```

## 15.7. app_settings

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY NOT NULL,
  theme TEXT NOT NULL DEFAULT 'system',
  language TEXT NOT NULL DEFAULT 'system',
  currency TEXT NOT NULL DEFAULT 'BRL',
  app_lock_enabled INTEGER NOT NULL DEFAULT 0,
  biometric_unlock_enabled INTEGER NOT NULL DEFAULT 0,
  hide_financial_values INTEGER NOT NULL DEFAULT 0,
  ads_enabled INTEGER NOT NULL DEFAULT 1,
  personalized_ads_consent TEXT DEFAULT 'unknown',
  expiration_warning_days INTEGER NOT NULL DEFAULT 7,
  low_stock_warning_enabled INTEGER NOT NULL DEFAULT 1,
  expiration_warning_enabled INTEGER NOT NULL DEFAULT 1,
  backup_reminder_enabled INTEGER NOT NULL DEFAULT 0,
  last_backup_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 15.8. ad_entitlements

```sql
CREATE TABLE IF NOT EXISTS ad_entitlements (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  feature_key TEXT,
  started_at TEXT NOT NULL,
  expires_at TEXT,
  remaining_uses INTEGER,
  daily_use_date TEXT NOT NULL,
  daily_use_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 15.9. feature_usage_limits

```sql
CREATE TABLE IF NOT EXISTS feature_usage_limits (
  id TEXT PRIMARY KEY NOT NULL,
  feature_key TEXT NOT NULL,
  date_key TEXT NOT NULL,
  period TEXT NOT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  free_limit INTEGER NOT NULL DEFAULT 0,
  rewarded_limit INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 15.10. audit_logs

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);
```

## 15.11. backup_records

```sql
CREATE TABLE IF NOT EXISTS backup_records (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  file_name TEXT,
  file_size_bytes INTEGER,
  encrypted INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TEXT NOT NULL
);
```

## 15.12. schema_migrations

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY NOT NULL,
  version INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);
```

---

# 16. Repositories

## 16.1. productRepository

Responsabilidades:

```txt
createProduct
updateProduct
archiveProduct
findProductById
findProducts
searchProducts
getLowStockProducts
getExpiringProducts
```

Não deve:

- calcular regra de negócio complexa;
- decidir feature premium;
- lidar com anúncios;
- acessar UI.

## 16.2. stockMovementRepository

Responsabilidades:

```txt
createMovement
findMovementsByProductId
findMovementsByDateRange
getRecentMovements
getMovementSummary
```

## 16.3. settingsRepository

Responsabilidades:

```txt
getSettings
updateSettings
ensureDefaultSettings
```

## 16.4. adEntitlementRepository

Responsabilidades:

```txt
createEntitlement
findActiveEntitlements
expireOldEntitlements
consumeFeatureUse
findEntitlementByFeature
```

## 16.5. auditLogRepository

Responsabilidades:

```txt
createAuditLog
findRecentAuditLogs
exportAuditLogs
```

---

# 17. Services

## 17.1. productService

Responsável por regras de produto.

```txt
validar produto
normalizar nome
verificar SKU/código de barras duplicado
chamar repository
registrar auditoria
```

## 17.2. stockService

Responsável por movimentação segura.

```txt
validar movimentação
calcular nova quantidade
executar transação
atualizar produto
criar stock_movement
registrar audit_log
```

## 17.3. reportService

Responsável por dados agregados.

```txt
total de produtos
valor total em estoque
produtos com baixo estoque
produtos vencidos/vencendo
entradas e saídas por período
lucro estimado se recurso estiver liberado
```

## 17.4. rewardedAccessService

Responsável por anúncios e feature gates.

```txt
verificar recompensa ativa
verificar recurso liberado
calcular expiração
aplicar recompensa
consumir uso
validar limite diário
```

## 17.5. backupService

Responsável por exportação/importação.

```txt
gerar backup JSON
validar backup
criptografar backup
restaurar com transação
registrar backup_record
registrar audit_log
```

## 17.6. securityService

Responsável por:

```txt
gerar chave local
recuperar chave do banco
ativar PIN
validar PIN
ativar biometria
bloquear/desbloquear app
```

---

# 18. Hooks

## 18.1. useProducts

Retorna lista de produtos, loading, erro e ações principais.

```ts
type UseProductsResult = {
  products: Product[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  createProduct: (input: CreateProductInput) => Promise<Product>;
  archiveProduct: (productId: string) => Promise<void>;
};
```

## 18.2. useProductDetail

```ts
type UseProductDetailResult = {
  product?: Product;
  movements: StockMovement[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
};
```

## 18.3. useStockMovement

```ts
type UseStockMovementResult = {
  createMovement: (input: CreateStockMovementInput) => Promise<void>;
  loading: boolean;
  error?: string;
};
```

## 18.4. useAppSettings

```ts
type UseAppSettingsResult = {
  settings: AppSettings;
  updateSettings: (input: Partial<AppSettings>) => Promise<void>;
  loading: boolean;
};
```

## 18.5. useFeatureGate

```ts
type UseFeatureGateResult = {
  canUseFeature: (feature: PremiumFeature) => boolean;
  getFeatureAccessState: (feature: PremiumFeature) => FeatureAccessState;
  refreshAccess: () => Promise<void>;
};
```

## 18.6. useAdsAccess

```ts
type UseAdsAccessResult = {
  isTemporaryAdFree: boolean;
  adFreeExpiresAt?: string;
  canRequestAdFreeReward: boolean;
  grantTemporaryAdFree: () => Promise<void>;
  grantFeatureUnlock: (feature: PremiumFeature) => Promise<void>;
};
```

---

# 19. Inputs para criação e atualização

## 19.1. CreateProductInput

```ts
type CreateProductInput = {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  supplierId?: string;
  initialQuantity: number;
  minQuantity: number;
  unit: ProductUnit;
  costPriceCents?: number;
  salePriceCents?: number;
  expirationDate?: string;
  batchCode?: string;
  location?: string;
  notes?: string;
};
```

## 19.2. UpdateProductInput

```ts
type UpdateProductInput = Partial<Omit<CreateProductInput, 'initialQuantity'>> & {
  id: string;
};
```

Regra:

`initialQuantity` não deve ser editado por update comum. Alteração de quantidade deve usar movimentação.

## 19.3. CreateStockMovementInput

```ts
type CreateStockMovementInput = {
  productId: string;
  type: StockMovementType;
  reason: StockMovementReason;
  quantity: number;
  unitCostCents?: number;
  unitSalePriceCents?: number;
  note?: string;
};
```

---

# 20. Feature gates

## 20.1. Estrutura

```ts
type FeatureAccessState = {
  featureKey: PremiumFeature;
  allowed: boolean;
  source: 'free' | 'rewarded_ad' | 'premium' | 'blocked';
  expiresAt?: string;
  remainingUses?: number;
  reason?: 'limit_reached' | 'requires_reward' | 'expired' | 'offline_required_ad';
};
```

## 20.2. Regras por recurso

| Feature | Grátis | Rewarded Interstitial | Observação |
|---|---:|---:|---|
| `advanced_pdf_reports` | relatório simples | PDF avançado por 24h | Não bloquear dados básicos |
| `csv_export` | 1 exportação diária | +3 exportações | Nunca bloquear backup mínimo |
| `barcode_scanner` | 5 leituras/dia | +10 leituras | Se falhar, permitir busca manual |
| `encrypted_backup` | backup JSON simples | backup criptografado | Exportação dos dados deve existir |
| `profit_analysis` | oculto/resumo básico | libera margem/lucro | Recurso avançado |
| `advanced_history` | últimas movimentações | histórico completo por filtros | Histórico básico sempre existe |
| `unlimited_categories` | até 5 categorias | ilimitado por 24h | Produto sem categoria continua possível |
| `batch_expiration_control` | validade simples | lote/validade avançada | Útil para estoque mais profissional |

## 20.3. Funções nunca bloqueadas

```txt
abrir app
ver produtos
cadastrar produto básico
editar produto básico
entrada de estoque
saída de estoque
ver quantidade atual
ver alerta de estoque baixo
trocar tema
trocar idioma
exportar dados essenciais
apagar dados do usuário
```

---

# 21. Validações

## 21.1. Produto

```txt
name: obrigatório, mínimo 2 caracteres
quantity: número válido, >= 0
minQuantity: número válido, >= 0
costPriceCents: inteiro >= 0 se informado
salePriceCents: inteiro >= 0 se informado
expirationDate: data válida se informada
barcode: único se informado
sku: único se informado
```

## 21.2. Movimento

```txt
productId: obrigatório e existente
quantity: número > 0
saída: não pode deixar estoque negativo na V1
type: precisa ser enum válido
reason: precisa ser enum válido
```

## 21.3. Categoria

```txt
name: obrigatório
name: único entre categorias ativas
sortOrder: inteiro
```

## 21.4. Fornecedor

```txt
name: obrigatório
email: formato válido se informado
phone: string flexível
```

## 21.5. Backup

```txt
arquivo precisa ter versão de schema
arquivo precisa ter appId válido
arquivo precisa passar validação antes de importar
arquivo não pode sobrescrever banco sem confirmação
```

---

# 22. Regras de segurança

## 22.1. Banco criptografado

- A build final deve usar SQLCipher.
- A chave deve ficar fora do banco.
- A chave deve ser criada no primeiro uso.
- A chave deve ser salva em SecureStore/Keychain/Keystore.

## 22.2. PIN e biometria

- PIN não deve ser salvo em texto puro.
- Usar hash seguro para PIN.
- Biometria deve ser opcional.
- App não deve impedir acesso definitivo se biometria falhar; deve permitir PIN.

## 22.3. Logs

Não registrar:

```txt
PIN
senha
chave do banco
chave de backup
conteúdo integral de backup
dados sensíveis desnecessários
```

## 22.4. Exportação

- Exportação simples deve avisar que o arquivo pode conter dados comerciais.
- Exportação criptografada deve exigir senha.
- Restauração deve pedir confirmação.

---

# 23. Backup JSON sugerido

## 23.1. Estrutura

```ts
type BackupFile = {
  app: 'EstoqueGuard Offline';
  schemaVersion: number;
  exportedAt: string;
  locale: SupportedLanguage;
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  stockMovements: StockMovement[];
  appSettings: AppSettings;
};
```

## 23.2. Regras

- Não exportar dados de anúncios como se fossem permanentes.
- Não exportar chave do banco.
- Não exportar PIN.
- Não exportar consentimento de anúncios se não for necessário.
- Exportar configurações úteis, como idioma, tema e moeda.

---

# 24. Relatórios e agregações

## 24.1. DashboardSummary

```ts
type DashboardSummary = {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  zeroStockCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  totalInventoryValueCents: number;
  currency: CurrencyCode;
  lastMovementAt?: string;
};
```

## 24.2. MovementSummary

```ts
type MovementSummary = {
  dateFrom: string;
  dateTo: string;
  totalInQuantity: number;
  totalOutQuantity: number;
  totalLossQuantity: number;
  totalCostCents: number;
  totalSaleCents: number;
  estimatedProfitCents?: number;
  currency: CurrencyCode;
};
```

## 24.3. ProductReportRow

```ts
type ProductReportRow = {
  productId: string;
  name: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  minQuantity: number;
  stockStatus: ProductStockStatus;
  costPriceCents?: number;
  salePriceCents?: number;
  totalValueCents?: number;
};
```

---

# 25. Internacionalização dos dados

## 25.1. O que deve ser traduzido

Traduzir via i18n:

```txt
rótulos
botões
mensagens de erro
nomes visuais de tipos de movimentação
nomes visuais de unidades
textos de anúncios
textos de premium
alertas
confirmações
```

## 25.2. O que não deve ser traduzido no banco

Não salvar tradução pronta no banco para:

```txt
tipo de movimentação
motivo de movimentação
status
featureKey
unidade
```

Salvar enum interno e traduzir na interface.

Exemplo correto:

```ts
movement.type = 'adjustment_positive';
t('movement.type.adjustment_positive');
```

---

# 26. Tema claro/escuro nos dados

O banco salva apenas preferência:

```ts
theme: 'system' | 'light' | 'dark'
```

O banco não salva cores de UI por usuário na V1.

Cores devem ficar no Design System.

---

# 27. Estados de erro

## 27.1. DatabaseError

```ts
type DatabaseErrorCode =
  | 'database_unavailable'
  | 'migration_failed'
  | 'query_failed'
  | 'transaction_failed'
  | 'record_not_found'
  | 'validation_failed'
  | 'encryption_failed';

type AppDatabaseError = {
  code: DatabaseErrorCode;
  message: string;
  safeMessageKey: string;
};
```

## 27.2. Regra de interface

A UI deve exibir mensagem segura, não erro técnico bruto.

Exemplo:

```txt
Não foi possível salvar o produto. Tente novamente.
```

Não mostrar:

```txt
SQLITE_CONSTRAINT_FOREIGNKEY at line...
```

---

# 28. Critérios de aceite do Data Model

O modelo de dados estará pronto quando:

```txt
[ ] Product cobre cadastro básico e avançado
[ ] Category organiza produtos
[ ] Supplier é opcional e simples
[ ] StockMovement registra toda alteração de estoque
[ ] AppSettings controla idioma, tema, moeda e segurança
[ ] AdEntitlement controla recompensas temporárias
[ ] FeatureUsageLimit controla limites de recursos
[ ] AuditLog registra alterações críticas
[ ] BackupRecord registra exportações/importações
[ ] SchemaMigration controla versões do banco
[ ] Quantidade de produto nunca muda sem histórico
[ ] Valores financeiros usam centavos
[ ] Datas usam ISO string
[ ] Telas não acessam SQLite diretamente
[ ] Regras de anúncios ficam centralizadas
[ ] Funções básicas não dependem de anúncio
[ ] Backup não exporta PIN/chaves
[ ] Segurança local está prevista
```

---

# 29. Ordem de implementação recomendada

```txt
1. Criar tipos em src/types/
2. Criar database/db.ts
3. Criar migrations iniciais
4. Criar repositories
5. Criar settingsRepository e garantir configurações padrão
6. Criar productRepository
7. Criar stockMovementRepository
8. Criar stockService com transação
9. Criar hooks de produtos e movimentações
10. Criar dashboard summary
11. Criar adEntitlementRepository
12. Criar rewardedAccessService
13. Criar backupService
14. Criar auditLogRepository
15. Criar testes manuais de persistência
16. Rodar typecheck
```

---

# 30. Prompt seguro para Codex — implementar Data Model

```md
Você é um dev sênior em Expo, React Native, TypeScript e SQLite.

Implemente somente a base de dados local do app EstoqueGuard Offline.

Leia antes:
- PROJECT_GUIDE.md
- docs/01_APP_BLUEPRINT.md
- docs/02_DESIGN_SYSTEM.md
- docs/03_USER_FLOW.md
- docs/05_DATA_MODEL.md

Objetivo:
Criar os tipos, database helper, migrations iniciais e repositories base para produtos, categorias, fornecedores, movimentações, configurações, recompensas de anúncios, logs de auditoria e backups.

Arquivos permitidos:
- src/types/
- src/database/
- src/services/
- src/hooks/ somente se necessário para integração básica

Arquivos proibidos:
- não alterar telas visuais
- não alterar navegação
- não implementar AdMob ainda
- não implementar tela premium ainda
- não implementar relatórios visuais ainda
- não adicionar login
- não adicionar sincronização em nuvem

Regras:
- usar TypeScript sem any
- usar repositories por domínio
- telas não podem acessar SQLite diretamente
- toda movimentação de estoque deve ser transacional
- não alterar quantidade sem stock_movement
- valores monetários devem ser inteiros em centavos
- datas devem ser ISO string
- criar migration versionada
- preparar SQLCipher, mas não hardcodar chave
- não salvar PIN, chave ou senha no banco
- limpar imports
- rodar npm run typecheck

Critérios de aceitação:
- migrations criam todas as tabelas da V1
- settings padrão são criadas se não existirem
- productRepository cria, lista, edita e arquiva produtos
- stockService cria movimentação e atualiza quantidade na mesma transação
- adEntitlementRepository registra recompensas temporárias
- auditLogRepository registra eventos críticos
- código compila sem erro de TypeScript
```

---

# 31. Observações finais

Este modelo deve ser considerado a base técnica da V1.

Qualquer nova função deve ser classificada antes de entrar no banco:

```txt
A. essencial para V1
B. bom para V1, mas não obrigatório
C. premium futuro
D. pós-lançamento
E. descartar
```

Regra final:

```txt
Nenhuma tela deve criar, editar ou excluir dados sem passar por service/repository.
Nenhuma alteração de estoque deve acontecer sem stock_movement.
Nenhum recurso básico deve depender de anúncio.
Nenhuma chave sensível deve ser salva no código ou em texto puro.
```
