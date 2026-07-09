# 06 — Codex Tasks

## App

**Nome provisório:** EstoqueGuard Offline  
**Stack:** Expo + React Native + TypeScript + Expo Router + SQLite local  
**Fase:** plano operacional para implementação controlada no Codex  
**Objetivo deste arquivo:** transformar o blueprint, design system, fluxo, screen specs e data model em tarefas pequenas, seguras e auditáveis.

---

# 1. Regra central para o Codex

O Codex deve trabalhar em ciclos curtos.

Cada tarefa deve ter:

```txt
1 objetivo claro
arquivos permitidos
arquivos proibidos
referências obrigatórias
critérios de aceitação
validação final com typecheck
```

O Codex não deve implementar o app inteiro de uma vez.

A ordem oficial é:

```txt
Auditoria inicial
→ Estrutura base
→ Design system
→ Internacionalização
→ Banco local
→ Repositórios
→ Navegação
→ Telas principais
→ Relatórios e alertas
→ Segurança
→ Ads e rewards
→ Auditoria final
→ Build
```

---

# 2. Documentos obrigatórios de referência

Antes de qualquer implementação, o Codex deve ler:

```txt
PROJECT_GUIDE.md

docs/01_APP_BLUEPRINT.md
docs/02_DESIGN_SYSTEM.md
docs/03_USER_FLOW.md
docs/04_SCREEN_SPECS.md
docs/05_DATA_MODEL.md
docs/06_CODEX_TASKS.md
```

Imagem de referência:

```txt
assets/screenshots-reference/00_mockup_collage.png
```

Se a imagem ainda estiver fora do projeto, copiar/renomear o arquivo aprovado para:

```txt
assets/screenshots-reference/00_mockup_collage.png
```

---

# 3. Regras globais de implementação

## 3.1. O Codex deve fazer

- Preservar TypeScript.
- Evitar `any`.
- Usar Expo Router.
- Separar UI, storage, banco, serviços e regras de negócio.
- Criar componentes globais reutilizáveis.
- Garantir suporte a tema claro, escuro e sistema.
- Garantir suporte a português, inglês e espanhol.
- Usar SQLite local para dados principais.
- Centralizar feature gates.
- Centralizar lógica de anúncios.
- Criar fallback seguro quando AdMob falhar.
- Tratar estados vazios, erro e carregamento.
- Rodar typecheck ao final de cada tarefa.
- Limpar imports não usados.

## 3.2. O Codex não deve fazer

- Não implementar funções fora do escopo da V1.
- Não criar sincronização em nuvem.
- Não criar login obrigatório.
- Não criar backend.
- Não misturar lógica de banco diretamente nas telas.
- Não espalhar textos fixos nas telas.
- Não usar cores fixas fora dos tokens.
- Não bloquear funções essenciais atrás de anúncios.
- Não exibir anúncio durante cadastro, edição ou movimentação crítica.
- Não hardcodar chaves de AdMob, RevenueCat ou qualquer SDK.
- Não alterar design system sem atualizar `docs/02_DESIGN_SYSTEM.md`.
- Não alterar modelo de dados sem atualizar `docs/05_DATA_MODEL.md`.
- Não criar rotas extras sem necessidade.

---

# 4. Comandos de validação

O Codex deve tentar executar, conforme existirem no projeto:

```bash
npm run typecheck
```

Se houver lint:

```bash
npm run lint
```

Se não existir script de typecheck, criar ou sugerir no `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

Para validar o Expo:

```bash
npx expo start --clear
```

Para build Android quando chegar na etapa final:

```bash
npx eas-cli build --platform android --profile production
```

Para build iOS quando chegar na etapa final:

```bash
npx eas-cli build --platform ios --profile production
```

---

# 5. Ordem das tarefas

## Resumo executivo

| Ordem | Tarefa | Objetivo | Tipo |
|---:|---|---|---|
| 00 | Auditoria inicial | Entender o projeto sem alterar arquivos | Obrigatória |
| 01 | Estrutura base | Criar organização de pastas e rotas mínimas | Obrigatória |
| 02 | Dependências essenciais | Instalar/configurar libs necessárias | Obrigatória |
| 03 | Design system global | Tokens, tema e componentes UI | Obrigatória |
| 04 | Internacionalização | PT-BR, EN e ES | Obrigatória |
| 05 | Navegação base | Expo Router, tabs e fluxos principais | Obrigatória |
| 06 | Banco local | SQLite, migrations e inicialização | Obrigatória |
| 07 | Repositórios | Camada de acesso a dados | Obrigatória |
| 08 | Hooks de domínio | Produtos, movimentos, settings e alerts | Obrigatória |
| 09 | Onboarding | Primeira abertura e preferências | Obrigatória |
| 10 | Dashboard | Home com métricas reais | Obrigatória |
| 11 | Produtos | Lista, busca e filtros | Obrigatória |
| 12 | Produto detalhe | Dados, alertas e histórico | Obrigatória |
| 13 | Produto novo/edição | Formulário completo | Obrigatória |
| 14 | Movimentação | Entrada, saída e ajustes | Obrigatória |
| 15 | Alertas | Estoque baixo, zerado e vencimento | Obrigatória |
| 16 | Categorias e fornecedores | Organização do estoque | Obrigatória |
| 17 | Relatórios | Resumo, CSV e PDF simples | Obrigatória |
| 18 | Configurações | Tema, idioma, moeda e privacidade | Obrigatória |
| 19 | Backup | Exportar, restaurar e apagar dados | Obrigatória |
| 20 | Segurança local | PIN, biometria e proteção visual | Obrigatória |
| 21 | Ads base | AdMob centralizado com fallback | Obrigatória |
| 22 | Rewards | Remover ads temporariamente e liberar recursos | Obrigatória |
| 23 | Polimento UX | Responsividade, estados e acessibilidade | Obrigatória |
| 24 | Auditoria final | Corrigir riscos reais | Obrigatória |
| 25 | Build | Preparar Android/iOS | Obrigatória |

---

# 6. Tarefa 00 — Auditoria inicial sem alteração

## Objetivo

Analisar o projeto atual sem alterar arquivos.

## Arquivos permitidos

Nenhum arquivo deve ser alterado.

## Arquivos proibidos

Todos.

## Referências

```txt
PROJECT_GUIDE.md
docs/01_APP_BLUEPRINT.md
docs/02_DESIGN_SYSTEM.md
docs/03_USER_FLOW.md
docs/04_SCREEN_SPECS.md
docs/05_DATA_MODEL.md
docs/06_CODEX_TASKS.md
package.json
tsconfig.json
app/
src/
```

## Prompt para o Codex

```md
Você é um dev sênior em Expo, React Native, TypeScript, Expo Router, SQLite local e arquitetura mobile offline-first.

Analise este projeto sem alterar arquivos.

Leia obrigatoriamente:
- PROJECT_GUIDE.md
- docs/01_APP_BLUEPRINT.md
- docs/02_DESIGN_SYSTEM.md
- docs/03_USER_FLOW.md
- docs/04_SCREEN_SPECS.md
- docs/05_DATA_MODEL.md
- docs/06_CODEX_TASKS.md

Entregue:
1. estrutura atual do projeto;
2. stack detectada;
3. dependências presentes;
4. dependências ausentes;
5. rotas existentes;
6. arquivos duplicados ou suspeitos;
7. riscos arquiteturais;
8. problemas de TypeScript;
9. problemas de tema/i18n;
10. plano de implementação em etapas;
11. primeira tarefa segura para começar.

Não altere arquivos.
Não instale dependências.
Não rode build.
```

## Critérios de aceitação

- O Codex entrega diagnóstico claro.
- Nenhum arquivo é alterado.
- Nenhuma dependência é instalada.
- Os riscos são listados antes de implementação.

---

# 7. Tarefa 01 — Estrutura base do projeto

## Objetivo

Criar ou ajustar a estrutura de pastas do projeto para suportar o app EstoqueGuard Offline.

## Arquivos permitidos

```txt
app/
src/
assets/
docs/
package.json
tsconfig.json
```

## Arquivos proibidos

```txt
android/
ios/
eas.json
.env
.env.*
```

## Fazer

Criar/garantir a estrutura:

```txt
app/
  _layout.tsx
  index.tsx
  onboarding/
    index.tsx
    usage-type.tsx
    preferences.tsx
    security.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    products.tsx
    alerts.tsx
    reports.tsx
    settings.tsx
  products/
    new.tsx
    [id].tsx
    movement.tsx
  categories/
    index.tsx
  suppliers/
    index.tsx
  premium.tsx
  backup.tsx

src/
  components/
    ui/
    dashboard/
    products/
    alerts/
    reports/
    settings/
    ads/
  constants/
  database/
    migrations/
    repositories/
  hooks/
  i18n/
    locales/
  services/
  types/
  utils/

assets/
  icons/
  images/
  screenshots-reference/
```

## Regras

- Não implementar visual final ainda.
- Criar arquivos mínimos apenas quando necessário.
- Não criar lógica de banco nesta tarefa.
- Não criar anúncios nesta tarefa.
- Não criar premium nesta tarefa.

## Critérios de aceitação

- Estrutura de pastas organizada.
- Rotas mínimas existem sem crash.
- TypeScript compila.
- Imports limpos.

---

# 8. Tarefa 02 — Dependências essenciais

## Objetivo

Instalar e configurar dependências essenciais para o app offline, multilíngue e com tema.

## Dependências esperadas

Verificar antes de instalar.

```bash
npx expo install expo-sqlite expo-secure-store expo-localization expo-application expo-device expo-file-system expo-sharing expo-print expo-local-authentication expo-crypto
```

Para i18n:

```bash
npm install i18n-js
```

Ou, se o projeto já usar i18next, manter o padrão existente.

Para formulários/validação, somente se necessário:

```bash
npm install zod
```

## Arquivos permitidos

```txt
package.json
package-lock.json
yarn.lock
pnpm-lock.yaml
app.json
app.config.ts
tsconfig.json
```

## Arquivos proibidos

```txt
src/components/
app/(tabs)/
app/products/
```

## Regras

- Verificar dependências existentes antes de instalar.
- Não adicionar bibliotecas pesadas sem justificativa.
- Não configurar AdMob ainda.
- Não configurar RevenueCat.
- Não modificar UI.

## Critérios de aceitação

- Dependências essenciais instaladas.
- Projeto ainda compila.
- Não há dependências duplicadas para a mesma função.
- Typecheck passa.

---

# 9. Tarefa 03 — Design system global

## Objetivo

Implementar tokens, tema claro/escuro e componentes globais reutilizáveis.

## Referências

```txt
docs/02_DESIGN_SYSTEM.md
docs/04_SCREEN_SPECS.md
```

## Arquivos permitidos

```txt
src/constants/colors.ts
src/constants/spacing.ts
src/constants/typography.ts
src/constants/radius.ts
src/constants/shadows.ts
src/hooks/useAppTheme.ts
src/components/ui/ScreenContainer.tsx
src/components/ui/SafeAreaContent.tsx
src/components/ui/AppHeader.tsx
src/components/ui/AppCard.tsx
src/components/ui/AppButton.tsx
src/components/ui/IconButton.tsx
src/components/ui/AppInput.tsx
src/components/ui/AppSelect.tsx
src/components/ui/AppTabs.tsx
src/components/ui/StatusBadge.tsx
src/components/ui/MetricCard.tsx
src/components/ui/EmptyState.tsx
src/components/ui/LoadingState.tsx
src/components/ui/ErrorState.tsx
src/components/ui/ConfirmDialog.tsx
src/components/ui/SectionTitle.tsx
src/components/ui/Divider.tsx
```

## Arquivos proibidos

```txt
src/database/
src/services/adsService.ts
src/services/backupService.ts
```

## Fazer

- Criar tokens de cor para light e dark.
- Criar hook `useAppTheme`.
- Criar componentes globais.
- Garantir área segura.
- Criar botão primário, secundário, ghost e danger.
- Criar cards e badges.
- Criar estados de loading, erro e vazio.
- Preparar ícones via biblioteca já existente no projeto.

## Regras

- Não usar cores hardcoded nas telas.
- Componentes devem aceitar props tipadas.
- Não usar `any`.
- Evitar lógica de negócio nos componentes UI.
- Não implementar telas finais.

## Critérios de aceitação

- Componentes globais renderizam sem erro.
- Tema claro/escuro funciona.
- Typecheck passa.
- Nenhum componente depende de dados reais.

---

# 10. Tarefa 04 — Internacionalização

## Objetivo

Implementar suporte inicial a vários idiomas desde a base do app.

## Idiomas da V1

```txt
pt-BR
en
es
```

## Arquivos permitidos

```txt
src/i18n/index.ts
src/i18n/locales/pt-BR.json
src/i18n/locales/en.json
src/i18n/locales/es.json
src/hooks/useI18n.ts
src/types/settings.ts
src/constants/languages.ts
```

## Arquivos proibidos

```txt
src/database/
src/services/adsService.ts
src/services/backupService.ts
```

## Fazer

- Configurar idioma do sistema por padrão.
- Criar função `t(key)`.
- Criar suporte a troca manual de idioma.
- Criar chaves para todas as telas principais.
- Preparar fallback para `pt-BR`.
- Criar tipos para idiomas suportados.

## Regras

- Não deixar texto fixo nas telas novas.
- Não misturar idiomas na interface.
- Não traduzir nomes técnicos internos.
- Não criar mais idiomas nesta etapa.

## Critérios de aceitação

- `pt-BR`, `en` e `es` carregam sem erro.
- Fallback funciona.
- Typecheck passa.
- Nenhuma tela nova deve depender de texto hardcoded.

---

# 11. Tarefa 05 — Navegação base

## Objetivo

Configurar Expo Router, fluxo inicial, onboarding e bottom tabs.

## Referências

```txt
docs/03_USER_FLOW.md
docs/04_SCREEN_SPECS.md
```

## Arquivos permitidos

```txt
app/_layout.tsx
app/index.tsx
app/onboarding/index.tsx
app/onboarding/usage-type.tsx
app/onboarding/preferences.tsx
app/onboarding/security.tsx
app/(tabs)/_layout.tsx
app/(tabs)/index.tsx
app/(tabs)/products.tsx
app/(tabs)/alerts.tsx
app/(tabs)/reports.tsx
app/(tabs)/settings.tsx
app/products/new.tsx
app/products/[id].tsx
app/products/movement.tsx
app/categories/index.tsx
app/suppliers/index.tsx
app/premium.tsx
app/backup.tsx
src/constants/routes.ts
src/components/ui/BottomTabBar.tsx
```

## Fazer

- Criar rotas base.
- Criar bottom tabs.
- Criar fluxo Splash → Onboarding → Dashboard.
- Criar navegação para Produto Detalhe, Novo Produto, Movimento, Premium e Backup.
- Criar placeholders mínimos usando componentes globais.

## Regras

- Não implementar telas completas ainda.
- Não criar dados mockados complexos.
- Não implementar banco ainda.
- Não implementar anúncios.

## Critérios de aceitação

- Todas as rotas abrem.
- Bottom tabs aparecem nas telas corretas.
- Telas modais/stack não quebram.
- Tema claro/escuro preservado.
- Typecheck passa.

---

# 12. Tarefa 06 — Banco local SQLite e migrations

## Objetivo

Implementar banco SQLite local com migrations versionadas.

## Referências

```txt
docs/05_DATA_MODEL.md
```

## Arquivos permitidos

```txt
src/database/db.ts
src/database/migrations/index.ts
src/database/migrations/001_initial_schema.ts
src/database/schema.ts
src/types/product.ts
src/types/stock.ts
src/types/category.ts
src/types/supplier.ts
src/types/settings.ts
src/types/ads.ts
src/types/audit.ts
src/utils/date.ts
src/utils/money.ts
```

## Fazer

Criar tabelas:

```txt
products
categories
suppliers
stock_movements
app_settings
ad_entitlements
audit_logs
backup_records
schema_migrations
```

## Regras

- Usar queries parametrizadas.
- Não acessar banco diretamente nas telas.
- Criar migration idempotente.
- Armazenar valores monetários em centavos.
- Datas em ISO string.
- Não implementar SQLCipher ainda se isso exigir prebuild imediato; deixar preparada a camada.

## Critérios de aceitação

- Banco inicializa sem crash.
- Migrations rodam uma vez.
- Tabelas são criadas corretamente.
- Typecheck passa.

---

# 13. Tarefa 07 — Repositórios de dados

## Objetivo

Criar camada limpa de acesso a dados.

## Arquivos permitidos

```txt
src/database/repositories/productRepository.ts
src/database/repositories/categoryRepository.ts
src/database/repositories/supplierRepository.ts
src/database/repositories/stockMovementRepository.ts
src/database/repositories/settingsRepository.ts
src/database/repositories/adEntitlementRepository.ts
src/database/repositories/auditLogRepository.ts
src/database/repositories/backupRecordRepository.ts
src/utils/validators.ts
src/utils/id.ts
```

## Fazer

- CRUD de produtos.
- CRUD de categorias.
- CRUD de fornecedores.
- Registrar movimentações.
- Buscar histórico por produto.
- Buscar alertas de estoque baixo/zerado/vencimento.
- Buscar dashboard summary.
- Ler/salvar settings.
- Ler/salvar entitlements de anúncios.
- Registrar logs de auditoria.

## Regras

- Repositórios não devem importar componentes.
- Repositórios não devem navegar.
- Usar transações para movimentações de estoque.
- Nunca alterar quantidade sem gerar histórico.
- Evitar exclusão definitiva; usar `isArchived`.

## Critérios de aceitação

- Repositórios tipados.
- Movimentação de estoque preserva histórico.
- Erros são tratados.
- Typecheck passa.

---

# 14. Tarefa 08 — Hooks de domínio

## Objetivo

Criar hooks que isolam lógica de negócio das telas.

## Arquivos permitidos

```txt
src/hooks/useProducts.ts
src/hooks/useProductDetail.ts
src/hooks/useStockMovements.ts
src/hooks/useDashboard.ts
src/hooks/useAlerts.ts
src/hooks/useCategories.ts
src/hooks/useSuppliers.ts
src/hooks/useSettings.ts
src/hooks/useFeatureGate.ts
src/hooks/useAdsAccess.ts
src/hooks/useBackup.ts
```

## Fazer

- Hooks com loading/error/data.
- Funções de criação, edição, arquivamento e movimentação.
- Refresh de dados após ações.
- Estados vazios.
- Integração com settings.
- Integração básica com feature gates.

## Regras

- Hooks podem usar repositórios.
- Telas devem usar hooks, não repositórios diretamente.
- Não misturar UI dentro dos hooks.
- Não usar dados mockados onde já houver banco.

## Critérios de aceitação

- Hooks tipados.
- Telas podem consumir dados sem conhecer SQLite.
- Typecheck passa.

---

# 15. Tarefa 09 — Onboarding

## Objetivo

Implementar primeira experiência do usuário.

## Telas

```txt
app/index.tsx
app/onboarding/index.tsx
app/onboarding/usage-type.tsx
app/onboarding/preferences.tsx
app/onboarding/security.tsx
```

## Referências

```txt
docs/03_USER_FLOW.md
docs/04_SCREEN_SPECS.md
assets/screenshots-reference/00_mockup_collage.png
```

## Fazer

- Splash/boas-vindas.
- Explicação de app offline.
- Seleção de tipo de uso.
- Preferências iniciais: tema, idioma e moeda.
- Segurança opcional: PIN/biometria posterior.
- Persistir `hasCompletedOnboarding` em settings.
- Navegar para dashboard ao finalizar.

## Regras

- Não pedir login.
- Não mostrar anúncio no onboarding.
- Não bloquear entrada do usuário.
- Não coletar dados pessoais desnecessários.

## Critérios de aceitação

- Primeira abertura mostra onboarding.
- Depois de finalizar, abre dashboard.
- Tema/idioma escolhidos são salvos.
- Typecheck passa.

---

# 16. Tarefa 10 — Dashboard / Início

## Objetivo

Implementar dashboard principal com métricas reais do estoque.

## Rota

```txt
app/(tabs)/index.tsx
```

## Componentes sugeridos

```txt
src/components/dashboard/TotalStockValueCard.tsx
src/components/dashboard/ProductSummaryGrid.tsx
src/components/dashboard/RecentMovementsCard.tsx
src/components/dashboard/ImportantAlertsCard.tsx
src/components/dashboard/QuickActionsBar.tsx
```

## Fazer

- Mostrar valor total em estoque.
- Mostrar produtos ativos.
- Mostrar itens baixos.
- Mostrar últimas movimentações.
- Mostrar alertas importantes.
- Criar CTA para adicionar produto.
- Criar CTA para movimentar estoque.

## Regras

- Uma informação, um lugar principal.
- Não duplicar métricas.
- Tela deve funcionar sem produtos.
- Tela deve funcionar com muitos produtos.
- Respeitar tema e i18n.

## Critérios de aceitação

- Dashboard usa dados reais.
- Estado vazio é claro.
- Cards seguem design system.
- Typecheck passa.

---

# 17. Tarefa 11 — Produtos / Lista

## Objetivo

Implementar lista de produtos com busca, filtros e estados.

## Rota

```txt
app/(tabs)/products.tsx
```

## Componentes sugeridos

```txt
src/components/products/ProductListItem.tsx
src/components/products/ProductSearchBar.tsx
src/components/products/ProductFilterChips.tsx
src/components/products/ProductStockBadge.tsx
```

## Fazer

- Listar produtos ativos.
- Buscar por nome, SKU, código de barras e categoria.
- Filtros: todos, baixo estoque, zerados, vencendo.
- Navegar para detalhe do produto.
- Botão para novo produto.

## Regras

- Produto arquivado não aparece por padrão.
- Não carregar todos os dados pesados em cards.
- Estado vazio deve orientar cadastro.
- Busca deve ser local.

## Critérios de aceitação

- Lista renderiza corretamente.
- Busca funciona.
- Filtros funcionam.
- Navegação para detalhe funciona.
- Typecheck passa.

---

# 18. Tarefa 12 — Produto / Detalhe

## Objetivo

Implementar tela de detalhe do produto.

## Rota

```txt
app/products/[id].tsx
```

## Componentes sugeridos

```txt
src/components/products/ProductHeaderCard.tsx
src/components/products/ProductMetricGrid.tsx
src/components/products/ProductHistoryPreview.tsx
src/components/products/ProductActions.tsx
```

## Fazer

- Mostrar nome, SKU, categoria e status.
- Mostrar quantidade atual.
- Mostrar estoque mínimo.
- Mostrar custo, venda e valor total.
- Mostrar localização, fornecedor e atualização.
- Mostrar histórico recente.
- Ações: editar, movimentar, arquivar.

## Regras

- Não permitir exclusão definitiva direta.
- Arquivamento exige confirmação.
- Se produto não existir, mostrar erro e voltar.
- Se valores financeiros estiverem ocultos, mascarar valores.

## Critérios de aceitação

- Detalhe usa dados reais.
- CTA movimentar funciona.
- Editar funciona ou navega para tela planejada.
- Typecheck passa.

---

# 19. Tarefa 13 — Produto novo e edição

## Objetivo

Implementar formulário de criação e edição de produto.

## Rotas

```txt
app/products/new.tsx
app/products/[id]/edit.tsx ou modo edit em rota existente, se preferir evitar nova rota
```

## Componentes sugeridos

```txt
src/components/products/ProductForm.tsx
src/components/products/CategoryPicker.tsx
src/components/products/SupplierPicker.tsx
src/components/products/UnitPicker.tsx
```

## Campos mínimos

```txt
nome
sku
código de barras
categoria
unidade
quantidade inicial
estoque mínimo
custo
preço de venda
validade
lote
localização
fornecedor
observações
```

## Regras

- Nome obrigatório.
- Quantidade não pode ser negativa.
- Estoque mínimo não pode ser negativo.
- Valores monetários devem virar centavos.
- Quantidade inicial deve gerar movimentação inicial.
- Edição de quantidade direta deve ser evitada; preferir movimentação.

## Critérios de aceitação

- Criar produto funciona.
- Editar produto funciona.
- Validações aparecem corretamente.
- Quantidade inicial gera histórico.
- Typecheck passa.

---

# 20. Tarefa 14 — Movimentar estoque

## Objetivo

Implementar entrada, saída e ajuste de estoque com transação segura.

## Rota

```txt
app/products/movement.tsx
```

## Fazer

- Selecionar produto.
- Escolher tipo: entrada, saída, ajuste.
- Informar quantidade.
- Informar motivo/categoria.
- Informar valor opcional.
- Salvar movimentação.
- Atualizar produto.
- Registrar histórico.
- Registrar auditoria.

## Regras

- Não permitir saída maior que estoque, exceto se ajuste explícito for permitido por configuração futura.
- Toda movimentação deve ser transacional.
- Não exibir anúncio durante o salvamento.
- Se falhar, não alterar quantidade parcial.

## Critérios de aceitação

- Entrada aumenta estoque.
- Saída reduz estoque.
- Ajuste registra histórico.
- Erro não corrompe dados.
- Typecheck passa.

---

# 21. Tarefa 15 — Alertas

## Objetivo

Implementar alertas de estoque baixo, zerado e vencimento.

## Rota

```txt
app/(tabs)/alerts.tsx
```

## Fazer

- Filtro por tipo de alerta.
- Lista de baixo estoque.
- Lista de estoque zerado.
- Lista de produtos vencendo.
- Ação rápida para movimentar/repor.
- Estado vazio positivo.

## Regras

- Alerta deve ser calculado a partir dos dados reais.
- Não duplicar alerta em várias seções simultaneamente sem clareza.
- Produtos arquivados não geram alerta.

## Critérios de aceitação

- Alertas aparecem corretamente.
- Produto zerado tem prioridade visual.
- CTA de reposição funciona.
- Typecheck passa.

---

# 22. Tarefa 16 — Categorias e fornecedores

## Objetivo

Implementar gerenciamento simples de categorias e fornecedores.

## Rotas

```txt
app/categories/index.tsx
app/suppliers/index.tsx
```

## Fazer

- Listar categorias.
- Criar categoria.
- Editar categoria.
- Arquivar categoria se possível.
- Listar fornecedores.
- Criar fornecedor.
- Editar fornecedor.
- Associar produtos.

## Regras

- Não excluir categoria com produtos sem confirmação clara.
- Não quebrar produtos ao arquivar categoria.
- Fornecedor é opcional.

## Critérios de aceitação

- Categorias aparecem no formulário de produto.
- Fornecedores aparecem no formulário de produto.
- Typecheck passa.

---

# 23. Tarefa 17 — Relatórios

## Objetivo

Implementar relatórios básicos e exportações controladas por feature gate.

## Rota

```txt
app/(tabs)/reports.tsx
```

## Fazer

- Resumo por período.
- Entradas no período.
- Saídas no período.
- Lucro bruto estimado.
- Produtos mais movimentados.
- Exportação CSV básica.
- Exportação PDF simples.

## Feature gates

```txt
csv_export
advanced_pdf_reports
profit_analysis
```

## Regras

- Relatório básico deve funcionar sem anúncio.
- CSV avançado pode exigir reward.
- PDF avançado pode exigir reward.
- Não bloquear acesso aos dados do usuário.
- Exportações devem respeitar idioma e moeda.

## Critérios de aceitação

- Relatório renderiza com dados reais.
- Período altera os números.
- Feature gate bloqueia somente função avançada.
- Typecheck passa.

---

# 24. Tarefa 18 — Configurações

## Objetivo

Implementar configurações centrais do app.

## Rota

```txt
app/(tabs)/settings.tsx
```

## Fazer

- Tema: sistema, claro, escuro.
- Idioma: sistema, pt-BR, en, es.
- Moeda: BRL, USD, EUR.
- Segurança: PIN/biometria.
- Backup e restauração.
- Gerenciar anúncios/recompensas.
- Ocultar valores financeiros.
- Sobre o app.
- Apagar todos os dados.

## Regras

- Alterações devem persistir.
- Apagar dados exige confirmação forte.
- Tema e idioma devem mudar sem reiniciar, se possível.
- Não incluir configurações sem função.

## Critérios de aceitação

- Tema troca corretamente.
- Idioma troca corretamente.
- Moeda muda formatação.
- Configurações persistem.
- Typecheck passa.

---

# 25. Tarefa 19 — Backup e restauração

## Objetivo

Implementar backup local manual e restauração segura.

## Rota

```txt
app/backup.tsx
```

## Fazer

- Criar backup local em JSON.
- Exportar/compartilhar arquivo.
- Listar backups existentes.
- Restaurar backup.
- Validar schema antes de restaurar.
- Criar registro em `backup_records`.

## Feature gate possível

```txt
encrypted_backup
```

## Regras

- Backup básico não deve bloquear dados do usuário.
- Backup criptografado pode ser reward/premium.
- Restauração deve pedir confirmação.
- Nunca restaurar arquivo inválido.
- Fazer backup atual antes de restaurar, se possível.

## Critérios de aceitação

- Backup é criado.
- Arquivo pode ser compartilhado/exportado.
- Restauração valida formato.
- Erro não apaga dados atuais.
- Typecheck passa.

---

# 26. Tarefa 20 — Segurança local

## Objetivo

Implementar camada de segurança local.

## Arquivos permitidos

```txt
src/services/securityService.ts
src/hooks/useAppLock.ts
src/components/settings/SecuritySettingsCard.tsx
src/components/ui/AppLockScreen.tsx
src/types/security.ts
```

## Fazer

- PIN local opcional.
- Biometria opcional.
- Ocultar valores financeiros.
- Preparar chave segura para banco/backup.
- Bloqueio ao reabrir app, se habilitado.

## Regras

- Não salvar PIN em texto puro.
- Não logar dados sensíveis.
- Não bloquear usuário permanentemente sem alternativa.
- SQLCipher pode ficar preparado para build final se exigir prebuild.

## Critérios de aceitação

- PIN funciona.
- Biometria funciona quando disponível.
- App não quebra quando biometria não existe.
- Typecheck passa.

---

# 27. Tarefa 21 — Ads base

## Objetivo

Criar camada centralizada de anúncios, sem espalhar AdMob pelas telas.

## Arquivos permitidos

```txt
src/services/adsService.ts
src/services/adConsentService.ts
src/hooks/useAds.ts
src/components/ads/AdBannerSlot.tsx
src/components/ads/RewardIntroSheet.tsx
src/types/ads.ts
src/constants/ads.ts
```

## Fazer

- Criar interface centralizada para ads.
- Criar modo mock/dev para desenvolvimento.
- Preparar banner.
- Preparar rewarded ad.
- Preparar rewarded interstitial.
- Criar fallback quando anúncio não carrega.
- Preparar consentimento para regiões que exigem.

## Regras

- Não hardcodar IDs reais.
- Usar IDs de teste em dev.
- Não mostrar anúncio no onboarding.
- Não mostrar anúncio durante cadastro/salvamento/movimentação.
- Não bloquear funções essenciais se anúncio falhar.

## Critérios de aceitação

- Serviço centralizado existe.
- Telas não importam SDK direto.
- Modo dev não quebra app.
- Typecheck passa.

---

# 28. Tarefa 22 — Rewards e feature gates

## Objetivo

Implementar os dois sistemas de recompensa por anúncio.

## Sistemas

```txt
1. Assistir anúncio para remover anúncios temporariamente.
2. Assistir intersticial premiado para liberar funções avançadas temporariamente.
```

## Arquivos permitidos

```txt
src/services/rewardedAccessService.ts
src/hooks/useFeatureGate.ts
src/hooks/useAdsAccess.ts
src/components/ads/RewardCard.tsx
src/components/ads/FeatureLockedCard.tsx
src/components/ui/PremiumLock.tsx
app/premium.tsx
src/constants/features.ts
src/database/repositories/adEntitlementRepository.ts
```

## Regras do sistema 1

```txt
Tipo: remove_ads_temporarily
Duração padrão: 1 hora
Acúmulo máximo: 3 horas
Limite diário: 5 usos
Não remove feature gate
Não cria premium vitalício
```

## Regras do sistema 2

```txt
Tipo: unlock_feature_temporarily
Duração padrão: 24 horas ou uso limitado, conforme recurso
Exige tela introdutória
Exige botão para recusar
Não pode bloquear funções essenciais
```

## Feature gates da V1

```txt
advanced_pdf_reports
csv_export
barcode_scanner
encrypted_backup
profit_analysis
advanced_history
unlimited_categories
batch_expiration_control
```

## Regras

- Toda recompensa deve ser salva em `ad_entitlements`.
- Recompensa expirada não deve liberar recurso.
- Se o anúncio falhar, mostrar alternativa clara.
- Nunca prometer recompensa sem entregar.
- Nunca entregar recompensa se o anúncio não foi concluído.

## Critérios de aceitação

- Remover anúncios temporariamente funciona.
- Feature gate funciona.
- Recompensa expira corretamente.
- Premium/reward screen é clara.
- Typecheck passa.

---

# 29. Tarefa 23 — Polimento UX, responsividade e acessibilidade

## Objetivo

Revisar todas as telas para qualidade visual e usabilidade.

## Verificar

```txt
Splash
Onboarding
Dashboard
Produtos
Produto detalhe
Adicionar produto
Movimentar estoque
Alertas
Relatórios
Categorias
Premium/Recompensas
Configurações
Backup
```

## Fazer

- Corrigir espaçamentos inconsistentes.
- Corrigir sobreposição com safe area.
- Corrigir telas pequenas.
- Corrigir tablet.
- Garantir contraste no tema claro/escuro.
- Garantir estados vazios.
- Garantir mensagens de erro úteis.
- Garantir botões com área de toque adequada.
- Reduzir texto excessivo.
- Evitar informação duplicada.

## Regras

- Não mudar arquitetura.
- Não adicionar novas funções.
- Não trocar identidade visual.
- Não mexer em banco sem necessidade.

## Critérios de aceitação

- App visualmente consistente.
- Funciona em celular pequeno.
- Funciona em tela maior/tablet.
- Tema claro/escuro sem quebras.
- Typecheck passa.

---

# 30. Tarefa 24 — Auditoria final antes da build

## Objetivo

Auditar o projeto inteiro como dev sênior antes de gerar build.

## Prompt para o Codex

```md
Faça uma auditoria final do app EstoqueGuard Offline antes da build.

Leia:
- PROJECT_GUIDE.md
- docs/01_APP_BLUEPRINT.md
- docs/02_DESIGN_SYSTEM.md
- docs/03_USER_FLOW.md
- docs/04_SCREEN_SPECS.md
- docs/05_DATA_MODEL.md
- docs/06_CODEX_TASKS.md

Verifique:
1. rotas quebradas;
2. imports quebrados;
3. componentes duplicados;
4. lógica espalhada;
5. textos hardcoded;
6. cores hardcoded;
7. problemas de responsividade;
8. erros em tema claro/escuro;
9. erros em i18n;
10. problemas de banco local;
11. problemas de transação de estoque;
12. feature gates incorretos;
13. anúncios em locais proibidos;
14. riscos de crash;
15. arquivos mortos;
16. inconsistências com os docs.

Corrija apenas problemas reais.
Não adicione funções novas.
Não mude design sem necessidade.
Ao final, rode typecheck e entregue resumo objetivo do que foi corrigido.
```

## Critérios de aceitação

- Typecheck passa.
- Sem rotas quebradas.
- Sem imports mortos relevantes.
- Sem cores/textos fora do padrão em telas principais.
- Sem lógica crítica espalhada.
- Sem anúncio em fluxo crítico.

---

# 31. Tarefa 25 — Preparação de build

## Objetivo

Preparar app para build Android/iOS.

## Arquivos permitidos

```txt
app.json
app.config.ts
eas.json
package.json
.env.example
README.md
docs/07_RELEASE_CHECKLIST.md
```

## Fazer

- Conferir nome do app.
- Conferir bundle identifier/package name.
- Conferir ícones e splash.
- Configurar permissões necessárias.
- Configurar variáveis de ambiente documentadas.
- Garantir IDs de teste vs produção para ads.
- Garantir política de privacidade preparada.
- Garantir app sem crash offline.
- Rodar build Android.
- Preparar build iOS.

## Regras

- Não colocar chaves reais no repositório.
- Não publicar build sem testar fluxo básico.
- Não ativar tracking sem declaração de privacidade adequada.
- Não enviar para loja com dados mockados aparentes.

## Critérios de aceitação

- Build Android passa.
- Build iOS preparado.
- App abre offline.
- Fluxo principal funciona.
- Documentação de release atualizada.

---

# 32. Ordem recomendada de envio ao Codex

Não enviar tudo de uma vez.

Use esta ordem:

```txt
1. Tarefa 00 — Auditoria inicial sem alteração
2. Tarefa 01 — Estrutura base
3. Tarefa 02 — Dependências essenciais
4. Tarefa 03 — Design system global
5. Tarefa 04 — Internacionalização
6. Tarefa 05 — Navegação base
7. Tarefa 06 — Banco local SQLite e migrations
8. Tarefa 07 — Repositórios de dados
9. Tarefa 08 — Hooks de domínio
10. Tarefa 09 — Onboarding
11. Tarefa 10 — Dashboard
12. Tarefa 11 — Produtos / Lista
13. Tarefa 12 — Produto / Detalhe
14. Tarefa 13 — Produto novo e edição
15. Tarefa 14 — Movimentar estoque
16. Tarefa 15 — Alertas
17. Tarefa 16 — Categorias e fornecedores
18. Tarefa 17 — Relatórios
19. Tarefa 18 — Configurações
20. Tarefa 19 — Backup e restauração
21. Tarefa 20 — Segurança local
22. Tarefa 21 — Ads base
23. Tarefa 22 — Rewards e feature gates
24. Tarefa 23 — Polimento UX
25. Tarefa 24 — Auditoria final
26. Tarefa 25 — Preparação de build
```

---

# 33. Prompt curto para iniciar no Codex

Use este prompt na primeira vez que abrir o projeto no Codex:

```md
# Contexto Atual do Projeto

Nome do app: EstoqueGuard Offline
Stack: Expo + React Native + TypeScript + Expo Router + SQLite local
Fase atual: início da implementação controlada
Objetivo desta conversa: executar a Tarefa 00 — Auditoria inicial sem alteração
Arquivos principais:
- PROJECT_GUIDE.md
- docs/01_APP_BLUEPRINT.md
- docs/02_DESIGN_SYSTEM.md
- docs/03_USER_FLOW.md
- docs/04_SCREEN_SPECS.md
- docs/05_DATA_MODEL.md
- docs/06_CODEX_TASKS.md
Imagem de referência:
- assets/screenshots-reference/00_mockup_collage.png
O que já está pronto:
- planejamento do produto
- design system
- fluxo de usuário
- modelo de dados
- screen specs
- plano de tarefas
O que NÃO deve ser alterado:
- nenhum arquivo nesta tarefa inicial
Critério de sucesso:
- entregar auditoria clara, riscos e primeira tarefa segura sem alterar arquivos

Execute somente a Tarefa 00 do arquivo docs/06_CODEX_TASKS.md.
```

---

# 34. Definition of Done global

Uma tarefa só pode ser considerada concluída se:

```txt
[ ] implementou apenas o combinado
[ ] respeitou os documentos do projeto
[ ] não criou função fora do escopo
[ ] não quebrou rotas
[ ] não duplicou componentes sem necessidade
[ ] não espalhou lógica crítica em telas
[ ] preservou tema claro/escuro
[ ] preservou i18n
[ ] preservou segurança local
[ ] não colocou anúncios em fluxos críticos
[ ] limpou imports
[ ] typecheck passa
[ ] entregou resumo objetivo do que mudou
```

---

# 35. Regra final

Se o Codex encontrar conflito entre documentos, seguir esta prioridade:

```txt
1. PROJECT_GUIDE.md
2. docs/06_CODEX_TASKS.md
3. docs/04_SCREEN_SPECS.md
4. docs/05_DATA_MODEL.md
5. docs/02_DESIGN_SYSTEM.md
6. docs/03_USER_FLOW.md
7. docs/01_APP_BLUEPRINT.md
8. mockup visual
9. conversa solta
```

A imagem define aparência.

A Screen Spec define comportamento.

O Data Model define dados.

O Design System define identidade visual.

O Codex Tasks define a ordem segura de execução.

