# 04 — Screen Specs

## App

**Nome provisório:** EstoqueGuard Offline  
**Stack:** Expo + React Native + TypeScript + Expo Router + SQLite local  
**Fase:** especificação técnica das telas  
**Referências principais:**

- `PROJECT_GUIDE.md`
- `docs/01_APP_BLUEPRINT.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/05_DATA_MODEL.md`
- `assets/screenshots-reference/00_mockup_collage.png`

---

# 1. Objetivo deste arquivo

Este documento transforma o layout visual aprovado em especificações técnicas para implementação no Codex.

A imagem serve como referência de aparência.  
Esta Screen Spec define comportamento, rotas, dados, ações, estados e critérios de aceite.

O Codex deve seguir este arquivo como regra funcional e usar o mockup apenas como referência visual.

---

# 2. Lista de telas especificadas

| Nº | Tela | Rota sugerida | Prioridade V1 |
|---:|---|---|---|
| 01 | Splash / Boas-vindas | `app/index.tsx` | Essencial |
| 02 | Onboarding | `app/onboarding/index.tsx` | Essencial |
| 03 | Dashboard / Início | `app/(tabs)/index.tsx` | Essencial |
| 04 | Produtos — Lista | `app/(tabs)/products.tsx` | Essencial |
| 05 | Produto — Detalhe | `app/products/[id].tsx` | Essencial |
| 06 | Adicionar Produto | `app/products/new.tsx` | Essencial |
| 07 | Movimentar Estoque | `app/products/movement.tsx` | Essencial |
| 08 | Alertas | `app/alerts/index.tsx` ou `app/(tabs)/alerts.tsx` | Essencial |
| 09 | Relatórios | `app/(tabs)/reports.tsx` | Essencial |
| 10 | Categorias | `app/categories/index.tsx` | Essencial |
| 11 | Premium / Recompensas | `app/premium.tsx` | Essencial |
| 12 | Configurações | `app/(tabs)/settings.tsx` | Essencial |
| 13 | Backup e Restauração | `app/backup.tsx` | Essencial |
| 14 | Modo Escuro — Exemplo | Não implementar como rota separada | Referência visual |

---

# 3. Regras globais para todas as telas

## 3.1. Componentes globais obrigatórios

Criar ou reutilizar componentes globais em `src/components/ui/`:

```txt
ScreenContainer
AppHeader
AppCard
AppButton
IconButton
AppInput
AppSelect
AppTabs
BottomTabBar
StatusBadge
MetricCard
EmptyState
LoadingState
ErrorState
ConfirmDialog
PremiumLock
RewardCard
SafeAreaContent
```

## 3.2. Tema claro e escuro

Todas as telas devem funcionar em:

```ts
type ThemeMode = 'system' | 'light' | 'dark';
```

Regras:

- não usar cores fixas diretamente na tela;
- todos os estilos devem consumir tokens do design system;
- alertas devem manter contraste em tema claro e escuro;
- status de sucesso, alerta e erro devem ser distinguíveis por cor e texto;
- o modo escuro não deve inverter imagens automaticamente.

## 3.3. Internacionalização

Todas as strings visíveis devem vir de i18n.

Não fazer:

```tsx
<Text>Adicionar produto</Text>
```

Fazer:

```tsx
<Text>{t('products.addProduct')}</Text>
```

Idiomas obrigatórios na V1:

```txt
pt-BR
en
es
```

## 3.4. Navegação inferior

A navegação principal deve ter no máximo 5 itens:

```txt
Início
Produtos
Adicionar / Movimentar
Relatórios ou Alertas
Mais
```

No mockup existem variações com `Movimentar` e `Mais`. A implementação deve priorizar clareza:

- `Início` → Dashboard
- `Produtos` → lista de produtos
- botão central `+` → menu rápido: adicionar produto, entrada, saída, ajuste
- `Relatórios` → relatórios básicos
- `Mais` → configurações, categorias, backup, premium, alertas se não estiverem no tab

## 3.5. Regras de dados

- Telas não devem acessar SQLite diretamente.
- Telas devem usar hooks.
- Hooks devem chamar services/repositories.
- Toda movimentação deve gerar registro em `stock_movements`.
- Toda alteração crítica deve gerar auditoria local.
- Exclusão definitiva deve exigir confirmação dupla.
- O app deve funcionar sem internet.

## 3.6. Regras para anúncios

- Não mostrar anúncio na primeira tela do onboarding.
- Não mostrar anúncio durante cadastro ou salvamento de movimentação.
- Não bloquear função essencial por anúncio.
- Rewarded Ad deve ser acionado apenas pelo usuário.
- Rewarded Interstitial deve ter tela introdutória clara e botão de recusa.
- Se o anúncio falhar, o app não pode travar.

## 3.7. Estados obrigatórios por tela

Sempre que aplicável, implementar:

```txt
carregando
vazio
erro
sucesso
sem internet
premium bloqueado
sem permissão
```

## 3.8. Responsividade

### Celular pequeno

- usar `ScrollView` quando houver formulário ou lista longa;
- evitar cards lado a lado se a largura for insuficiente;
- manter CTA principal visível no final da tela;
- não cortar bottom tab;
- respeitar safe area.

### Tablet

- limitar largura máxima de conteúdo;
- centralizar container;
- permitir layout com 2 colunas em dashboard, relatórios e detalhe do produto;
- não esticar cards demais.

---

# 4. Screen Spec — 01. Splash / Boas-vindas

## Imagem de referência

`assets/screenshots-reference/01_splash_welcome.png`

## Rota

`app/index.tsx`

## Objetivo

Exibir a identidade do app, carregar configurações iniciais e decidir se o usuário deve ir para o onboarding ou para o dashboard.

## Componentes necessários

- `ScreenContainer`
- `AppLogo`
- `LoadingIndicator`
- `SecureStorageInitializer`

## Dados necessários

- `hasCompletedOnboarding`
- `themeMode`
- `language`
- `databaseStatus`
- `securityStatus`

## Ações do usuário

Nenhuma ação obrigatória.

## Comportamento

1. Abrir app.
2. Inicializar tema.
3. Inicializar idioma.
4. Inicializar banco local.
5. Verificar onboarding.
6. Navegar automaticamente:
   - se onboarding pendente → `app/onboarding/index.tsx`;
   - se onboarding concluído → `app/(tabs)/index.tsx`.

## Estados

- **carregando:** logo, nome do app e indicador inferior.
- **erro de banco:** mostrar mensagem objetiva e botão “Tentar novamente”.
- **erro de segurança:** mostrar fallback sem travar app.

## Regras visuais

- Fundo escuro ou claro conforme tema.
- Logo centralizado.
- Nome `EstoqueGuard` em destaque.
- Texto curto: app offline, seguro e privado.
- Não inserir botões extras.
- Não exibir anúncios.

## Regras funcionais

- A tela não deve durar artificialmente mais que o necessário.
- Não deve depender de internet.
- Não deve pedir permissão nesta etapa.
- Não deve mostrar popup de anúncio.

## Critérios de aceitação

- A tela abre sem crash.
- O app decide corretamente a rota inicial.
- O tema é aplicado antes da navegação.
- O idioma é aplicado antes da navegação.
- O banco local é inicializado.
- Funciona offline.
- Typecheck passa.

---

# 5. Screen Spec — 02. Onboarding

## Imagem de referência

`assets/screenshots-reference/02_onboarding.png`

## Rota

`app/onboarding/index.tsx`

## Objetivo

Explicar a proposta do app e coletar configurações básicas antes do primeiro uso.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `AppCard`
- `AppButton`
- `ProgressDots`
- `FeatureBullet`
- `LanguageSelector`
- `ThemeSelector`
- `CurrencySelector`

## Dados necessários

```ts
type OnboardingDraft = {
  usageType?: 'store' | 'workshop' | 'personal' | 'service' | 'other';
  language: 'system' | 'pt-BR' | 'en' | 'es';
  theme: 'system' | 'light' | 'dark';
  currency: 'BRL' | 'USD' | 'EUR';
  appLockEnabled: boolean;
};
```

## Ações do usuário

- tocar em “Vamos começar” → avança para configuração inicial;
- tocar em “Pular” → usa valores padrão e conclui onboarding;
- selecionar idioma → atualiza i18n imediatamente;
- selecionar tema → altera tema imediatamente;
- selecionar moeda → salva preferência;
- ativar segurança → direciona para criação de PIN/biometria.

## Estados

- **primeira etapa:** apresentação do app;
- **configuração:** idioma, tema e moeda;
- **segurança:** PIN/biometria opcional;
- **erro ao salvar:** mostrar botão “Tentar novamente”.

## Regras visuais

- Usar ilustração limpa de prancheta/caixas.
- Mostrar 3 benefícios curtos:
  - funciona offline;
  - seguro;
  - completo.
- CTA principal em verde.
- Link “Pular” discreto.
- Não mostrar anúncio.

## Regras funcionais

- Onboarding deve ser curto.
- Não exigir login.
- Não exigir internet.
- Não coletar dados pessoais desnecessários.
- Concluir onboarding deve criar `app_settings` inicial.

## Critérios de aceitação

- Usuário consegue concluir onboarding.
- Usuário consegue pular onboarding.
- Idioma muda sem reiniciar app.
- Tema muda sem reiniciar app.
- Configurações persistem após fechar o app.
- Nenhum anúncio aparece.
- Typecheck passa.

---

# 6. Screen Spec — 03. Dashboard / Início

## Imagem de referência

`assets/screenshots-reference/03_dashboard.png`

## Rota

`app/(tabs)/index.tsx`

## Objetivo

Mostrar uma visão rápida e acionável do estoque: valor total, produtos cadastrados, itens baixos, últimas movimentações e alertas importantes.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `MetricCard`
- `AppCard`
- `MovementList`
- `AlertSummaryCard`
- `BottomTabBar`
- `QuickActionButton`
- `StatusBadge`

## Dados necessários

```ts
type DashboardSummary = {
  totalStockValueCents: number;
  activeProductsCount: number;
  lowStockCount: number;
  zeroStockCount: number;
  expiringSoonCount: number;
  lastMovements: StockMovementWithProduct[];
  updatedAt: string;
};
```

## Ações do usuário

- tocar em sino/alerta → navega para `app/alerts/index.tsx`;
- tocar em “Ver todos” em movimentações → navega para histórico/relatórios;
- tocar em card “Produtos” → navega para lista de produtos;
- tocar em card “Itens baixos” → navega para produtos filtrados por baixo estoque;
- tocar no botão central `+` → abre menu rápido;
- tocar em movimentação → abre detalhe do produto relacionado.

## Estados

- **sem produtos:** mostrar empty state com CTA “Adicionar primeiro produto”.
- **sem movimentações:** mostrar card vazio com orientação.
- **carregando:** skeleton nos cards.
- **erro:** botão “Recarregar”.
- **valores ocultos:** se `hideFinancialValues = true`, ocultar valor total.

## Regras visuais

- Saudação no topo.
- Valor total como métrica principal.
- Cards menores para produtos e itens baixos.
- Lista curta de últimas movimentações.
- Alertas importantes abaixo das movimentações.
- Evitar excesso de métricas.
- Não duplicar o mesmo número em múltiplos cards.

## Regras funcionais

- Dashboard deve recalcular dados a partir do banco local.
- Não salvar dados mockados em produção.
- Atualizar automaticamente após entrada/saída de estoque.
- Não bloquear dashboard por anúncio.
- Deve funcionar com 0, 10, 100 ou 1000 produtos.

## Critérios de aceitação

- Dashboard abre sem crash.
- Dados exibidos batem com banco local.
- Empty state funciona.
- Cards navegam corretamente.
- Botão central abre ações rápidas.
- Funciona em tema claro e escuro.
- Funciona em celular pequeno e tablet.
- Typecheck passa.

---

# 7. Screen Spec — 04. Produtos — Lista

## Imagem de referência

`assets/screenshots-reference/04_products_list.png`

## Rota

`app/(tabs)/products.tsx`

## Objetivo

Permitir visualizar, buscar, filtrar e acessar produtos cadastrados.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `SearchInput`
- `FilterChips`
- `ProductListItem`
- `StatusBadge`
- `EmptyState`
- `BottomTabBar`
- `FloatingActionButton`

## Dados necessários

```ts
type ProductListQuery = {
  search?: string;
  status?: 'all' | 'low_stock' | 'zero_stock' | 'expiring' | 'archived';
  categoryId?: string;
  sortBy?: 'name' | 'quantity' | 'updatedAt' | 'stockValue';
};
```

## Ações do usuário

- digitar na busca → filtra por nome, SKU, código de barras ou categoria;
- tocar em chip “Todos” → remove filtros;
- tocar em “Baixo estoque” → mostra produtos com `quantity <= minQuantity`;
- tocar em “Zerados” → mostra produtos com `quantity === 0`;
- tocar no ícone de filtro → abre filtros avançados;
- tocar em produto → navega para `app/products/[id].tsx`;
- tocar em `+` no topo → navega para `app/products/new.tsx`.

## Estados

- **lista vazia:** CTA “Adicionar produto”.
- **sem resultado de busca:** mensagem “Nenhum produto encontrado”.
- **carregando:** skeleton de lista.
- **erro:** card com botão tentar novamente.
- **muitos produtos:** usar lista virtualizada.

## Regras visuais

- Lista em cards compactos.
- Mostrar imagem/ícone do produto, nome, categoria, quantidade atual e mínimo.
- Destacar baixo estoque em amarelo/laranja.
- Destacar zerado em vermelho.
- Quantidade deve ser legível.
- Não poluir com todos os dados financeiros na lista.

## Regras funcionais

- Busca deve ser local.
- Filtros devem funcionar offline.
- Lista deve ser performática com muitos produtos.
- Produto arquivado não deve aparecer por padrão.
- Tocar em produto arquivado só deve ser possível por filtro específico.

## Critérios de aceitação

- Busca funciona.
- Filtros funcionam.
- Produto abre detalhe correto.
- Adicionar produto navega corretamente.
- Empty state funciona.
- Lista não trava com muitos itens.
- Tema claro/escuro funciona.
- Typecheck passa.

---

# 8. Screen Spec — 05. Produto — Detalhe

## Imagem de referência

`assets/screenshots-reference/05_product_detail.png`

## Rota

`app/products/[id].tsx`

## Objetivo

Mostrar todos os dados importantes de um produto e permitir editar ou movimentar estoque.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `ProductImageHeader`
- `StatusBadge`
- `MetricGrid`
- `AppCard`
- `AppButton`
- `MovementPreviewList`
- `ConfirmDialog`

## Dados necessários

```ts
type ProductDetailView = {
  product: Product;
  category?: Category;
  supplier?: Supplier;
  lastMovements: StockMovement[];
  stockStatus: 'normal' | 'low_stock' | 'zero_stock' | 'expired' | 'expiring';
};
```

## Ações do usuário

- voltar → retorna para lista;
- tocar em “Editar” → abre formulário de edição;
- tocar em “Movimentar” → abre `app/products/movement.tsx` com `productId` preenchido;
- tocar em histórico completo → abre histórico filtrado;
- tocar em arquivar produto → confirma arquivamento;
- tocar em excluir definitivo → confirmação dupla, apenas em área avançada.

## Estados

- **carregando:** skeleton do detalhe.
- **produto não encontrado:** estado de erro com voltar.
- **produto arquivado:** mostrar badge “Arquivado”.
- **estoque zerado:** destaque vermelho.
- **estoque baixo:** destaque amarelo.

## Regras visuais

- Cabeçalho com imagem/ícone do produto.
- Nome e categoria em destaque.
- Badge de status no topo.
- Métricas em grade:
  - quantidade atual;
  - estoque mínimo;
  - valor de custo;
  - valor de venda;
  - valor total;
  - localização;
  - fornecedor;
  - última atualização.
- CTA principal: “Movimentar”.
- CTA secundário: “Editar”.

## Regras funcionais

- Não editar quantidade diretamente nesta tela.
- Toda mudança de quantidade deve passar por movimentação.
- Arquivar não deve apagar histórico.
- Se valores financeiros estiverem ocultos, esconder custo, venda e total.
- Produto zerado ainda pode receber entrada.

## Critérios de aceitação

- Detalhe abre com produto correto.
- Botão editar funciona.
- Botão movimentar leva produto selecionado.
- Status de estoque está correto.
- Valores ocultam quando configurado.
- Produto inexistente não causa crash.
- Tema claro/escuro funciona.
- Typecheck passa.

---

# 9. Screen Spec — 06. Adicionar Produto

## Imagem de referência

`assets/screenshots-reference/06_add_product.png`

## Rota

`app/products/new.tsx`

## Objetivo

Cadastrar um novo produto com dados suficientes para controle de estoque profissional.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `AppInput`
- `AppSelect`
- `MoneyInput`
- `QuantityInput`
- `ImagePickerButton`
- `AppButton`
- `FormSection`
- `ValidationMessage`

## Dados necessários

```ts
type ProductFormDraft = {
  name: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  supplierId?: string;
  unit: ProductUnit;
  quantity: number;
  minQuantity: number;
  costPriceCents?: number;
  salePriceCents?: number;
  expirationDate?: string;
  batchCode?: string;
  location?: string;
  notes?: string;
  imageUri?: string;
};
```

## Ações do usuário

- tocar em voltar → se houver alterações, perguntar se deseja descartar;
- tocar em adicionar foto → abrir seletor de imagem ou câmera;
- preencher nome → obrigatório;
- selecionar categoria → opcional;
- selecionar unidade → obrigatório;
- preencher quantidade inicial → obrigatório, padrão 0;
- preencher estoque mínimo → obrigatório, padrão 0;
- tocar em salvar/check → valida e cria produto;
- tocar em criar categoria dentro do select → abre modal de categoria rápida.

## Estados

- **formulário vazio:** campos com placeholders.
- **erro de validação:** exibir mensagem abaixo do campo.
- **salvando:** bloquear CTA e mostrar loading.
- **sucesso:** salvar e navegar para detalhe do produto.
- **erro ao salvar:** manter dados preenchidos.

## Regras visuais

- Formulário em seções.
- Campos com altura confortável.
- CTA de salvar no topo direito ou no final da tela.
- Não colocar muitos campos obrigatórios.
- Campos avançados podem ficar em seção expansível:
  - validade;
  - lote;
  - localização;
  - fornecedor;
  - observações.

## Regras funcionais

- Nome é obrigatório.
- Unidade é obrigatória.
- Quantidade inicial não pode ser negativa.
- Estoque mínimo não pode ser negativo.
- Valores monetários devem ser salvos em centavos.
- Criar produto com quantidade inicial deve gerar movimentação inicial do tipo `adjustment_positive` ou `initial_stock`.
- Não mostrar anúncio antes de salvar.

## Critérios de aceitação

- Produto é criado corretamente.
- Validações funcionam.
- Dados persistem no banco.
- Movimentação inicial é registrada.
- Usuário não perde dados após erro.
- Tela rola corretamente em celular pequeno.
- Tema claro/escuro funciona.
- Typecheck passa.

---

# 10. Screen Spec — 07. Movimentar Estoque

## Imagem de referência

`assets/screenshots-reference/07_stock_movement.png`

## Rota

`app/products/movement.tsx`

## Objetivo

Registrar entrada, saída ou ajuste de estoque de forma segura, rastreável e rápida.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `SegmentedControl`
- `ProductSelector`
- `QuantityInput`
- `AppSelect`
- `MoneyInput`
- `AppInput`
- `AppButton`
- `ValidationMessage`
- `ConfirmDialog`

## Dados necessários

```ts
type StockMovementForm = {
  productId: string;
  type: 'in' | 'out' | 'loss' | 'return' | 'adjustment_positive' | 'adjustment_negative';
  quantity: number;
  reason?: string;
  unitCostCents?: number;
  notes?: string;
};
```

## Ações do usuário

- selecionar aba “Entrada” → tipo `in`;
- selecionar aba “Saída” → tipo `out`;
- selecionar aba “Ajuste” → escolher ajuste positivo/negativo;
- selecionar produto → preenche unidade e estoque atual;
- informar quantidade → obrigatório;
- informar motivo → recomendado;
- informar valor unitário → opcional;
- tocar em salvar movimentação → valida e grava transação;
- tocar em voltar com dados preenchidos → confirmar descarte.

## Estados

- **produto vindo do detalhe:** produto já selecionado.
- **sem produtos cadastrados:** CTA “Adicionar produto”.
- **quantidade inválida:** bloquear salvamento.
- **saída maior que estoque:** pedir confirmação ou bloquear conforme configuração.
- **salvando:** loading no CTA.
- **sucesso:** atualizar estoque e voltar ao detalhe/dashboard.

## Regras visuais

- Segmented control no topo.
- Campos compactos e objetivos.
- CTA principal fixo no final.
- Mostrar unidade ao lado da quantidade.
- Não misturar entrada e saída no mesmo estado visual.

## Regras funcionais

- Movimentação deve rodar em transação.
- Atualizar produto e inserir histórico no mesmo fluxo.
- Não permitir quantidade zero.
- Não permitir quantidade negativa.
- Se saída deixar estoque abaixo do mínimo, gerar alerta.
- Se saída deixar estoque zerado, gerar alerta zerado.
- Não mostrar anúncio antes ou depois imediato do salvamento crítico.

## Critérios de aceitação

- Entrada aumenta estoque.
- Saída reduz estoque.
- Ajuste altera estoque conforme tipo.
- Histórico é registrado.
- Dashboard atualiza.
- Alertas são gerados corretamente.
- Validações impedem dados inválidos.
- Typecheck passa.

---

# 11. Screen Spec — 08. Alertas

## Imagem de referência

`assets/screenshots-reference/08_alerts.png`

## Rota

`app/alerts/index.tsx` ou `app/(tabs)/alerts.tsx`

## Objetivo

Listar alertas críticos do estoque: produtos baixos, zerados, vencendo e vencidos.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `FilterChips`
- `AlertListSection`
- `AlertListItem`
- `StatusBadge`
- `EmptyState`
- `AppButton`

## Dados necessários

```ts
type StockAlert = {
  id: string;
  productId: string;
  type: 'low_stock' | 'zero_stock' | 'expiring' | 'expired';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  createdAt: string;
  resolvedAt?: string;
};
```

## Ações do usuário

- tocar em “Todos” → mostra todos os alertas ativos;
- tocar em “Baixo estoque” → filtra por baixo estoque;
- tocar em “Zerados” → filtra zerados;
- tocar em “Vencendo” → filtra vencimentos;
- tocar em produto → abre detalhe;
- tocar em “Ver todos” por seção → expande lista;
- tocar em alerta resolvido → opcionalmente ocultar.

## Estados

- **sem alertas:** mostrar estado positivo “Tudo certo no estoque”.
- **muitos alertas:** agrupar por gravidade.
- **erro:** botão recarregar.
- **carregando:** skeleton.

## Regras visuais

- Separar seções por gravidade:
  - baixo estoque;
  - estoque zerado;
  - vencendo/vencido.
- Usar ícones de alerta.
- Quantidade atual e estoque mínimo devem aparecer de forma clara.
- Não exibir textos longos.

## Regras funcionais

- Alertas devem ser calculados localmente a partir dos produtos.
- Não criar alertas duplicados para o mesmo estado.
- Alertas resolvidos automaticamente quando estoque volta ao normal.
- Produtos arquivados não devem gerar alertas ativos.

## Critérios de aceitação

- Alertas aparecem corretamente.
- Filtros funcionam.
- Produto abre detalhe.
- Sem alertas mostra empty state positivo.
- Alertas atualizam após movimentação.
- Tema claro/escuro funciona.
- Typecheck passa.

---

# 12. Screen Spec — 09. Relatórios

## Imagem de referência

`assets/screenshots-reference/09_reports.png`

## Rota

`app/(tabs)/reports.tsx`

## Objetivo

Apresentar resumo operacional e financeiro do estoque, com exportação básica e recursos avançados por recompensa/premium.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `PeriodSelector`
- `MetricCard`
- `ReportCard`
- `ProductRankingList`
- `AppButton`
- `PremiumLock`
- `RewardUnlockModal`

## Dados necessários

```ts
type ReportSummary = {
  period: 'today' | 'week' | 'month' | 'custom';
  entriesValueCents: number;
  exitsValueCents: number;
  estimatedProfitCents?: number;
  movedProductsCount: number;
  topProductsByQuantity: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
};
```

## Ações do usuário

- selecionar período → recalcula relatório;
- tocar em “Exportar CSV” → verifica feature gate;
- tocar em “Gerar PDF” → verifica feature gate;
- tocar em produto do ranking → abre detalhe;
- tocar em recurso bloqueado → abre fluxo de recompensa.

## Estados

- **sem dados no período:** empty state.
- **carregando:** skeleton.
- **recurso bloqueado:** mostrar `PremiumLock`.
- **recurso liberado por anúncio:** liberar por uso ou tempo.
- **erro ao exportar:** mensagem e tentar novamente.

## Regras visuais

- Cards de métricas em grade.
- Período no topo.
- Ranking curto de produtos.
- Botões de exportação no final.
- Recursos avançados devem ser identificados, mas não agressivos.

## Regras funcionais

- Relatórios devem usar dados locais.
- CSV básico pode ser grátis ou limitado.
- PDF avançado pode ser liberado por rewarded interstitial.
- Exportação deve funcionar offline.
- Se valores financeiros estiverem ocultos, pedir autorização/PIN ou ocultar métricas financeiras.

## Critérios de aceitação

- Relatório calcula entradas e saídas corretamente.
- Período altera os dados.
- Exportação respeita feature gate.
- Recompensa libera recurso corretamente.
- Sem dados mostra empty state.
- Tema claro/escuro funciona.
- Typecheck passa.

---

# 13. Screen Spec — 10. Categorias

## Imagem de referência

`assets/screenshots-reference/10_categories.png`

## Rota

`app/categories/index.tsx`

## Objetivo

Permitir visualizar, criar, editar e organizar categorias de produtos.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `CategoryListItem`
- `IconButton`
- `CategoryFormModal`
- `ConfirmDialog`
- `EmptyState`

## Dados necessários

```ts
type CategoryView = {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  productsCount: number;
  createdAt: string;
};
```

## Ações do usuário

- tocar em `+` → abre modal para nova categoria;
- tocar em categoria → abre lista de produtos filtrada;
- manter pressionado ou menu → editar/excluir;
- excluir categoria → confirmar e tratar produtos vinculados.

## Estados

- **sem categorias:** mostrar CTA “Criar categoria”.
- **limite de categorias atingido:** se houver feature gate, mostrar bloqueio/recompensa.
- **categoria com produtos:** impedir exclusão direta ou pedir remapeamento.
- **erro:** tentar novamente.

## Regras visuais

- Lista simples.
- Cada categoria com ícone, nome e seta.
- Não exibir métricas excessivas.
- Botão `+` no topo direito.

## Regras funcionais

- Categorias padrão podem ser criadas no primeiro uso:
  - Ferragens;
  - Elétricos;
  - Eletrônicos;
  - Iluminação;
  - Hidráulicos;
  - Diversos.
- Categoria `Diversos` não deve ser excluída se usada como fallback.
- Excluir categoria não deve excluir produtos.
- Produtos devem ser remanejados para `Diversos` ou ficar sem categoria.

## Critérios de aceitação

- Categorias aparecem.
- Nova categoria pode ser criada.
- Editar funciona.
- Excluir respeita produtos vinculados.
- Tocar em categoria filtra produtos.
- Tema claro/escuro funciona.
- Typecheck passa.

---

# 14. Screen Spec — 11. Premium / Recompensas

## Imagem de referência

`assets/screenshots-reference/11_premium_rewards.png`

## Rota

`app/premium.tsx`

## Objetivo

Centralizar recompensas por anúncios, remoção temporária de anúncios e desbloqueio temporário de recursos avançados.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `RewardCard`
- `PremiumLock`
- `AppButton`
- `CountdownBadge`
- `FeatureUnlockList`
- `ConsentNotice`
- `ErrorState`

## Dados necessários

```ts
type RewardsScreenState = {
  temporaryAdFree?: TemporaryAdFreeReward;
  unlockedFeatures: FeaturePassReward[];
  rewardedAdAvailable: boolean;
  rewardedInterstitialAvailable: boolean;
  dailyRewardLimitReached: boolean;
};
```

## Ações do usuário

- tocar em “Assistir anúncio” no card de remover anúncios → abre rewarded ad;
- tocar em “Ver recursos disponíveis” → lista recursos liberáveis;
- tocar em recurso bloqueado → abre rewarded interstitial introdutório;
- tocar em “Agora não” → fecha sem bloquear app;
- tocar em informação legal → abre privacidade/termos.

## Estados

- **sem internet:** informar que anúncios precisam de conexão.
- **anúncio indisponível:** mostrar tentar depois.
- **recompensa ativa:** mostrar tempo restante.
- **limite diário atingido:** mostrar quando reinicia.
- **erro no anúncio:** não liberar recompensa e não travar app.
- **recompensa concluída:** salvar entitlement local.

## Regras visuais

- Card 1: remover anúncios temporariamente.
- Card 2: liberar recursos por anúncio.
- Se houver recompensa ativa, mostrar countdown.
- Área “Importante” explicando que funções básicas sempre continuam disponíveis.
- Não usar linguagem enganosa como “premium grátis permanente”.

## Regras funcionais

- Rewarded Ad comum remove anúncios temporariamente.
- Rewarded Interstitial libera recurso específico por tempo/uso.
- O usuário deve ver a recompensa antes de assistir.
- Deve existir opção clara de recusa.
- Estado deve ser centralizado em `useAdsAccess` e `useFeatureGate`.
- Não hardcodar IDs reais de anúncio no código.

## Critérios de aceitação

- Tela abre sem internet.
- Mostra recompensas disponíveis.
- Rewarded Ad remove anúncios pelo tempo definido.
- Rewarded Interstitial libera recurso correto.
- Countdown funciona.
- Limite diário funciona.
- Falha no anúncio não quebra app.
- Typecheck passa.

---

# 15. Screen Spec — 12. Configurações

## Imagem de referência

`assets/screenshots-reference/12_settings.png`

## Rota

`app/(tabs)/settings.tsx`

## Objetivo

Permitir configurar tema, idioma, moeda, segurança, backup, anúncios e dados do app.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `SettingsListItem`
- `SettingsSection`
- `AppSelectModal`
- `ConfirmDialog`
- `DangerZoneCard`
- `AppVersionText`

## Dados necessários

```ts
type SettingsViewState = {
  theme: ThemeMode;
  language: AppLanguage;
  currency: AppCurrency;
  appLockEnabled: boolean;
  biometricEnabled: boolean;
  adsEnabled: boolean;
  appVersion: string;
};
```

## Ações do usuário

- tocar em tema → modal: sistema, claro, escuro;
- tocar em idioma → modal: sistema, português, inglês, espanhol;
- tocar em moeda → modal de moeda;
- tocar em segurança → configurar PIN/biometria;
- tocar em backup → navega para `app/backup.tsx`;
- tocar em gerenciar anúncios → navega para `app/premium.tsx`;
- tocar em sobre → mostra versão e links legais;
- tocar em apagar todos os dados → confirmação dupla.

## Estados

- **sem biometria disponível:** mostrar PIN apenas.
- **erro ao salvar configuração:** mostrar mensagem.
- **alteração aplicada:** feedback discreto.
- **zona de perigo:** confirmar antes de apagar dados.

## Regras visuais

- Lista de configurações agrupada.
- Ícones consistentes.
- Valores atuais alinhados à direita.
- Item perigoso em vermelho.
- Não mostrar anúncios nesta tela de forma intrusiva.

## Regras funcionais

- Alterar tema deve refletir imediatamente.
- Alterar idioma deve refletir imediatamente.
- Alterar moeda não deve converter valores antigos automaticamente; apenas altera formato de exibição se todos os valores forem salvos na moeda escolhida inicialmente.
- Apagar dados deve limpar produtos, movimentos, categorias personalizadas, backups locais registrados e configurações não essenciais.
- Não apagar dados sem confirmação dupla.

## Critérios de aceitação

- Tema altera corretamente.
- Idioma altera corretamente.
- Moeda altera exibição.
- Segurança abre fluxo correto.
- Backup navega corretamente.
- Apagar dados exige confirmação dupla.
- Tema claro/escuro funciona.
- Typecheck passa.

---

# 16. Screen Spec — 13. Backup e Restauração

## Imagem de referência

`assets/screenshots-reference/13_backup.png`

## Rota

`app/backup.tsx`

## Objetivo

Permitir criar, visualizar, restaurar e gerenciar backups locais dos dados do estoque.

## Componentes necessários

- `ScreenContainer`
- `AppHeader`
- `BackupCard`
- `BackupListItem`
- `AppButton`
- `ConfirmDialog`
- `PasswordInputModal`
- `FilePickerButton`
- `ShareExportButton`

## Dados necessários

```ts
type BackupRecord = {
  id: string;
  fileName: string;
  fileUri: string;
  sizeBytes: number;
  createdAt: string;
  encrypted: boolean;
  appVersion: string;
  schemaVersion: number;
};
```

## Ações do usuário

- tocar em “Criar backup” → gerar arquivo local;
- escolher senha de backup → criptografar arquivo;
- tocar em backup existente → opções: compartilhar, restaurar, excluir;
- tocar em “Restaurar backup” → selecionar arquivo;
- confirmar restauração → substituir dados atuais;
- excluir backup → confirmar.

## Estados

- **sem backups:** mostrar orientação.
- **criando backup:** loading.
- **backup criado:** mostrar sucesso e arquivo na lista.
- **restaurando:** bloquear ações até concluir.
- **senha incorreta:** mostrar erro.
- **arquivo incompatível:** mostrar erro claro.

## Regras visuais

- Card principal “Fazer backup”.
- Lista de backups existentes abaixo.
- Botão “Restaurar backup” em destaque secundário.
- Restauração deve parecer ação sensível.
- Não usar textos longos.

## Regras funcionais

- Backup deve conter dados essenciais:
  - produtos;
  - categorias;
  - fornecedores;
  - movimentações;
  - configurações;
  - entitlements locais válidos, se aplicável.
- Backup deve incluir versão do schema.
- Restaurar deve validar arquivo antes de substituir dados.
- Restauração deve exigir confirmação dupla.
- Backup criptografado deve exigir senha.
- Não enviar dados para servidor.

## Critérios de aceitação

- Backup é criado.
- Backup aparece na lista.
- Backup pode ser compartilhado/exportado.
- Backup pode ser restaurado.
- Arquivo inválido não quebra app.
- Confirmação dupla funciona.
- Tema claro/escuro funciona.
- Typecheck passa.

---

# 17. Screen Spec — 14. Modo Escuro — Exemplo

## Imagem de referência

`assets/screenshots-reference/14_dark_mode_example.png`

## Rota

Não implementar como rota separada.

## Objetivo

Servir como referência visual para garantir que a tela Dashboard funcione corretamente em modo escuro.

## Componentes necessários

Mesmos componentes da tela 03:

- `ScreenContainer`
- `AppHeader`
- `MetricCard`
- `AppCard`
- `MovementList`
- `AlertSummaryCard`
- `BottomTabBar`

## Dados necessários

Mesmos dados de `DashboardSummary`.

## Regras visuais

- Fundo escuro profundo.
- Cards com superfície levemente elevada.
- Texto principal claro.
- Texto secundário com contraste suficiente.
- Verde usado apenas para ações e destaques positivos.
- Alertas devem permanecer legíveis.

## Regras funcionais

- Não criar rota duplicada.
- Não duplicar componente de dashboard só para modo escuro.
- O tema deve ser resolvido por tokens.
- A mesma tela deve renderizar corretamente em light e dark.

## Critérios de aceitação

- Dashboard funciona em modo escuro.
- Dashboard funciona em modo claro.
- Não existe rota duplicada para o modo escuro.
- Não existe lógica visual duplicada.
- Typecheck passa.

---

# 18. Componentes específicos por domínio

## 18.1. Produtos

Criar em `src/components/products/`:

```txt
ProductListItem.tsx
ProductImageHeader.tsx
ProductForm.tsx
ProductSelector.tsx
StockStatusBadge.tsx
MovementPreviewList.tsx
```

## 18.2. Dashboard

Criar em `src/components/dashboard/`:

```txt
DashboardMetricCard.tsx
StockValueCard.tsx
LowStockCard.tsx
RecentMovementsCard.tsx
ImportantAlertsCard.tsx
```

## 18.3. Relatórios

Criar em `src/components/reports/`:

```txt
PeriodSelector.tsx
ReportMetricGrid.tsx
TopProductsList.tsx
ExportActions.tsx
```

## 18.4. Ads / Recompensas

Criar em `src/components/ads/`:

```txt
RewardCard.tsx
RewardCountdown.tsx
RewardUnlockModal.tsx
FeatureUnlockList.tsx
AdUnavailableState.tsx
```

## 18.5. Configurações

Criar em `src/components/settings/`:

```txt
SettingsListItem.tsx
SettingsSection.tsx
ThemeModeModal.tsx
LanguageModal.tsx
CurrencyModal.tsx
DangerZoneCard.tsx
```

---

# 19. Hooks necessários

Criar em `src/hooks/`:

```txt
useAppTheme.ts
useI18n.ts
useDashboardSummary.ts
useProducts.ts
useProductDetail.ts
useProductForm.ts
useStockMovement.ts
useStockAlerts.ts
useReports.ts
useCategories.ts
useSettings.ts
useBackup.ts
useAdsAccess.ts
useFeatureGate.ts
```

Regras:

- Hooks devem expor estado, ações e erros.
- Hooks não devem conter UI.
- Telas não devem chamar repositórios diretamente.

---

# 20. Services necessários

Criar em `src/services/`:

```txt
adsService.ts
rewardedAccessService.ts
featureGateService.ts
stockMovementService.ts
dashboardService.ts
reportService.ts
backupService.ts
securityService.ts
settingsService.ts
```

Regras:

- Services concentram regra de negócio.
- Repositories acessam SQLite.
- Telas usam hooks.
- Hooks usam services.

---

# 21. Repositories necessários

Criar em `src/database/repositories/`:

```txt
productRepository.ts
categoryRepository.ts
supplierRepository.ts
stockMovementRepository.ts
settingsRepository.ts
adEntitlementRepository.ts
auditLogRepository.ts
backupRepository.ts
```

---

# 22. Ordem segura de implementação das telas

Seguir esta ordem no Codex:

```txt
1. Base visual global
2. Tema claro/escuro
3. i18n
4. Navegação base
5. Splash
6. Onboarding
7. SQLite + repositories básicos
8. Produtos lista
9. Adicionar produto
10. Produto detalhe
11. Movimentar estoque
12. Dashboard
13. Alertas
14. Categorias
15. Relatórios
16. Configurações
17. Backup
18. Premium/Recompensas
19. Auditoria final
```

Motivo: premium, anúncios e backup dependem de dados, navegação e estado global já estáveis.

---

# 23. Prompt seguro para Codex — implementar base visual antes das telas

```md
Você é um dev sênior em Expo, React Native e TypeScript.

Implemente somente a base visual global do app EstoqueGuard Offline.

Leia antes:
- PROJECT_GUIDE.md
- docs/01_APP_BLUEPRINT.md
- docs/02_DESIGN_SYSTEM.md
- docs/03_USER_FLOW.md
- docs/04_SCREEN_SPECS.md

Faça:
- tokens de cores para light e dark;
- tokens de spacing, radius e typography;
- ScreenContainer;
- AppHeader;
- AppCard;
- AppButton;
- IconButton;
- AppInput;
- AppSelect;
- EmptyState;
- LoadingState;
- ErrorState;
- StatusBadge;
- MetricCard;
- base do BottomTabBar;
- hook useAppTheme;
- estrutura inicial de i18n sem traduzir tudo ainda.

Regras:
- não implementar telas completas;
- não implementar banco ainda;
- não implementar AdMob ainda;
- não criar funções fora do escopo;
- preservar Expo Router;
- manter TypeScript estrito;
- limpar imports;
- rodar npm run typecheck;
- corrigir erros encontrados.

Critérios de aceitação:
- app abre sem crash;
- tema claro e escuro existem;
- componentes globais compilam;
- typecheck passa.
```

---

# 24. Prompt seguro para Codex — implementar uma tela

Usar este modelo para cada tela:

```md
Você é um dev sênior em Expo, React Native e TypeScript.

Implemente somente a tela [NOME DA TELA].

Leia antes:
- PROJECT_GUIDE.md
- docs/01_APP_BLUEPRINT.md
- docs/02_DESIGN_SYSTEM.md
- docs/03_USER_FLOW.md
- docs/04_SCREEN_SPECS.md
- docs/05_DATA_MODEL.md

Tela:
[NOME DA TELA]

Rota:
[ROTA]

Imagem de referência:
[CAMINHO DA IMAGEM]

Objetivo:
[OBJETIVO DA TELA]

Regras:
- seguir a imagem como referência visual;
- seguir a Screen Spec como regra funcional;
- usar componentes globais existentes;
- não criar função fora do escopo;
- não duplicar informação;
- não alterar premium, storage ou navegação se não for necessário;
- manter responsivo para Android, iOS e tablet;
- manter suporte a tema claro/escuro;
- usar i18n para todos os textos;
- limpar imports;
- rodar npm run typecheck;
- corrigir erros encontrados.

Critérios de aceitação:
- tela abre sem crash;
- visual está próximo da referência;
- componentes são reutilizáveis;
- não há dados duplicados;
- não há imports quebrados;
- typecheck passa.
```

---

# 25. Regras do que o Codex NÃO deve alterar neste ciclo

Durante a implementação das telas, o Codex não deve:

- mudar a promessa do app;
- alterar o modelo de monetização;
- criar login obrigatório;
- criar sincronização em nuvem;
- criar painel web;
- adicionar dependências sem justificar;
- hardcodar IDs reais de AdMob;
- hardcodar chaves sensíveis;
- duplicar tela para tema claro/escuro;
- acessar SQLite diretamente dentro de componentes visuais;
- bloquear funções essenciais por anúncio;
- criar recursos fora da V1.

---

# 26. Definition of Done das telas

Uma tela só é considerada pronta se:

```txt
[ ] abre sem crash
[ ] segue o design system
[ ] usa componentes globais
[ ] usa i18n
[ ] funciona em tema claro
[ ] funciona em tema escuro
[ ] funciona em celular pequeno
[ ] funciona em tablet
[ ] trata estado vazio
[ ] trata estado de carregamento
[ ] trata erro
[ ] não duplica informação
[ ] não acessa banco diretamente
[ ] não força anúncio indevido
[ ] não quebra navegação
[ ] typecheck passa
```

---

# 27. Observação final

As telas do mockup definem a direção visual premium, escura, limpa e funcional do app.

A implementação deve respeitar a hierarquia, composição e estilo visual, mas não deve copiar literalmente inconsistências da imagem caso alguma informação esteja duplicada, pequena demais, ilegível ou difícil de manter em React Native.

A Screen Spec é a regra funcional principal.
