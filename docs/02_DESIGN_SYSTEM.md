# Design System — EstoqueGuard Offline

## 1. Objetivo do design system

Este documento define a base visual, estrutural e comportamental do app **EstoqueGuard Offline**.

O design system deve garantir que o app seja:

- profissional;
- limpo;
- robusto;
- seguro visualmente;
- fácil de usar em celular pequeno;
- compatível com Android e iOS;
- preparado para tema claro e escuro;
- pronto para múltiplos idiomas;
- consistente com monetização por anúncios premiados;
- escalável para futuras funções premium.

O app deve transmitir a sensação de um **sistema de estoque profissional**, mas sem parecer complexo demais para pequenos negócios e autônomos.

---

## 2. Personalidade visual

### 2.1. Conceito visual

O app deve parecer:

- confiável;
- técnico;
- moderno;
- organizado;
- premium;
- direto;
- seguro;
- corporativo sem ser frio demais.

A interface deve lembrar um painel profissional de controle, com cards claros, indicadores objetivos, botões bem definidos e hierarquia visual forte.

### 2.2. Palavras-chave visuais

```txt
Controle
Segurança
Estoque
Organização
Precisão
Profissionalismo
Offline
Produtividade
Confiabilidade
```

### 2.3. O que evitar

Evitar:

- visual infantil;
- excesso de gradientes;
- excesso de ícones decorativos;
- telas muito coloridas;
- cards sem função clara;
- anúncios visualmente agressivos;
- textos longos em telas operacionais;
- botões competindo entre si;
- uso de cores sem semântica.

---

## 3. Direção de marca

## 3.1. Nome visual provisório

```txt
EstoqueGuard Offline
```

## 3.2. Símbolo conceitual

O ícone e a marca podem usar referências a:

- caixa;
- escudo;
- check;
- gráfico de estoque;
- código de barras;
- prateleira;
- cubo minimalista.

Direção recomendada:

```txt
Um cubo/caixa protegido por um escudo, com detalhe sutil de gráfico ou check.
```

### 3.3. Estilo do ícone

O ícone deve ser:

- simples;
- legível em tamanho pequeno;
- sem textos;
- com contraste forte;
- compatível com fundo claro e escuro;
- adequado para App Store e Play Store.

---

## 4. Sistema de cores

O app deve ter suporte completo a:

```ts
type ThemeMode = 'system' | 'light' | 'dark';
```

O padrão inicial deve ser:

```txt
system
```

Nenhuma tela deve usar cor fixa diretamente. Todas as cores devem vir de tokens.

---

# 5. Paleta principal

## 5.1. Cores de marca

| Token | Cor | Uso |
|---|---:|---|
| `brand.primary` | `#2563EB` | ações principais, links, foco visual |
| `brand.primaryDark` | `#1D4ED8` | botão pressionado, estados ativos |
| `brand.secondary` | `#0F766E` | estoque, organização, confirmação |
| `brand.accent` | `#F59E0B` | avisos, destaques controlados |
| `brand.premium` | `#8B5CF6` | recursos premiados/premium |

### Regra

- Azul deve representar **controle e confiança**.
- Verde deve representar **estoque saudável, entrada e sucesso**.
- Amarelo deve representar **atenção, estoque baixo e vencimento**.
- Vermelho deve representar **perigo, perda, exclusão e estoque zerado**.
- Roxo deve representar **função liberada, premium ou recompensa**.

---

# 6. Tema claro

```ts
export const lightTheme = {
  mode: 'light',

  background: '#F8FAFC',
  backgroundSecondary: '#EEF2F7',

  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F1F5F9',

  primary: '#2563EB',
  primaryPressed: '#1D4ED8',
  primarySoft: '#DBEAFE',

  secondary: '#0F766E',
  secondarySoft: '#CCFBF1',

  accent: '#F59E0B',
  accentSoft: '#FEF3C7',

  premium: '#8B5CF6',
  premiumSoft: '#EDE9FE',

  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',

  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  danger: '#DC2626',
  dangerSoft: '#FEE2E2',

  warning: '#D97706',
  warningSoft: '#FEF3C7',

  success: '#16A34A',
  successSoft: '#DCFCE7',

  info: '#0284C7',
  infoSoft: '#E0F2FE',

  overlay: 'rgba(15, 23, 42, 0.45)',
  shadow: 'rgba(15, 23, 42, 0.08)',
};
```

---

# 7. Tema escuro

```ts
export const darkTheme = {
  mode: 'dark',

  background: '#020617',
  backgroundSecondary: '#0F172A',

  surface: '#111827',
  surfaceElevated: '#1E293B',
  surfaceMuted: '#0F172A',

  primary: '#60A5FA',
  primaryPressed: '#3B82F6',
  primarySoft: '#172554',

  secondary: '#2DD4BF',
  secondarySoft: '#134E4A',

  accent: '#FBBF24',
  accentSoft: '#451A03',

  premium: '#A78BFA',
  premiumSoft: '#2E1065',

  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textInverse: '#020617',

  border: '#1E293B',
  borderStrong: '#334155',

  danger: '#F87171',
  dangerSoft: '#450A0A',

  warning: '#FBBF24',
  warningSoft: '#451A03',

  success: '#4ADE80',
  successSoft: '#052E16',

  info: '#38BDF8',
  infoSoft: '#082F49',

  overlay: 'rgba(0, 0, 0, 0.60)',
  shadow: 'rgba(0, 0, 0, 0.35)',
};
```

---

# 8. Cores semânticas de estoque

## 8.1. Status de produto

| Status | Token | Uso |
|---|---|---|
| Estoque saudável | `success` | quantidade acima do mínimo |
| Estoque baixo | `warning` | quantidade igual ou abaixo do mínimo |
| Estoque zerado | `danger` | quantidade igual a zero |
| Vencendo | `accent` | item próximo da validade |
| Vencido | `danger` | validade ultrapassada |
| Arquivado | `textMuted` | item removido da operação principal |

## 8.2. Movimentações

| Tipo | Cor |
|---|---|
| Entrada | `success` |
| Saída | `primary` |
| Perda | `danger` |
| Ajuste positivo | `secondary` |
| Ajuste negativo | `warning` |
| Devolução | `info` |

---

# 9. Tipografia

## 9.1. Fonte recomendada

Usar fonte do sistema por padrão:

```txt
iOS: San Francisco
Android: Roboto
```

Motivo:

- melhor performance;
- menos peso no app;
- aparência nativa;
- menor risco de renderização inconsistente.

## 9.2. Escala tipográfica

```ts
export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
  },
  title1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
  },
  title2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  title3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  bodyLarge: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  captionStrong: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
};
```

## 9.3. Regras de texto

- Títulos devem ser curtos.
- Botões devem usar verbo de ação.
- Cards devem ter no máximo 2 níveis de texto.
- Textos longos devem ir para telas explicativas, não para dashboard.
- Labels de formulário devem ser claros e objetivos.
- Evitar caixa alta em textos longos.

---

# 10. Espaçamento

```ts
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};
```

## Regras

- Margem lateral padrão: `16px` em celular.
- Margem lateral em tablet: `24px` ou layout com largura máxima.
- Espaçamento entre cards: `12px` a `16px`.
- Padding interno de cards: `16px`.
- Telas operacionais devem priorizar densidade controlada.
- Dashboard pode usar cards maiores.

---

# 11. Raios de borda

```ts
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};
```

## Uso recomendado

| Elemento | Raio |
|---|---:|
| Inputs | `12` |
| Cards | `18` |
| Botões | `14` |
| Badges | `999` |
| Modais | `24` |
| Bottom sheets | `24` topo |

---

# 12. Sombras e elevação

## 12.1. Regra geral

Sombras devem ser discretas. No tema escuro, usar mais contraste de superfície do que sombra.

```ts
export const elevation = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
};
```

## 12.2. Uso

| Elemento | Elevação |
|---|---:|
| Card comum | `sm` |
| Card importante | `md` |
| Modal | `lg` |
| Header fixo | `sm` |
| Botão flutuante | `md` |

---

# 13. Grid e layout

## 13.1. Mobile primeiro

O app deve ser desenhado primeiro para celular pequeno.

Largura base de referência:

```txt
360px a 430px
```

## 13.2. Tablet

Em telas grandes:

- usar largura máxima para conteúdo principal;
- evitar cards esticados demais;
- dashboard pode virar grid de 2 colunas;
- lista de produtos pode usar layout mais denso;
- formulário deve manter largura confortável.

## 13.3. Safe area

Toda tela deve respeitar:

- topo com notch;
- área inferior de gesto;
- bottom tab;
- teclado aberto;
- orientação vertical como padrão.

---

# 14. Componentes globais obrigatórios

Todos devem ficar em:

```txt
src/components/ui/
```

## 14.1. ScreenContainer

### Objetivo

Padronizar estrutura das telas.

### Props sugeridas

```ts
type ScreenContainerProps = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  safeArea?: boolean;
  background?: 'default' | 'secondary';
};
```

### Regras

- Deve aplicar tema automaticamente.
- Deve respeitar safe area.
- Deve permitir scroll quando necessário.
- Deve evitar conteúdo colado na bottom tab.

---

## 14.2. AppHeader

### Uso

- Dashboard;
- telas internas;
- configurações;
- relatórios;
- produto detalhe.

### Variações

```ts
type AppHeaderVariant = 'large' | 'compact' | 'modal';
```

### Elementos

- título;
- subtítulo opcional;
- botão voltar opcional;
- ação direita opcional;
- badge opcional.

---

## 14.3. AppCard

### Uso

Base para praticamente todos os blocos visuais.

### Props sugeridas

```ts
type AppCardProps = {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'danger' | 'premium';
  padding?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
};
```

### Regras

- Card clicável deve ter feedback visual.
- Card de alerta deve usar cor semântica suave.
- Card premium deve usar token `premium`.
- Card não deve conter mais de 2 CTAs.

---

## 14.4. AppButton

### Variações

```ts
type AppButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'premium';
```

### Tamanhos

```ts
type AppButtonSize = 'sm' | 'md' | 'lg';
```

### Alturas

| Tamanho | Altura |
|---|---:|
| sm | 40 |
| md | 48 |
| lg | 56 |

### Regras

- CTA principal usa `primary`.
- Ações destrutivas usam `danger`.
- Recursos liberados por anúncio usam `premium`.
- Botão desativado deve ter contraste suficiente.
- Loading deve impedir múltiplos toques.

---

## 14.5. AppInput

### Tipos

- texto;
- número;
- moeda;
- quantidade;
- data;
- busca.

### Regras

- Label sempre visível.
- Erro abaixo do campo.
- Máscara de moeda quando necessário.
- Teclado numérico para quantidade e valores.
- Evitar placeholder como única identificação.

---

## 14.6. EmptyState

### Uso

- sem produtos;
- sem alertas;
- sem relatórios;
- sem fornecedores;
- sem histórico.

### Estrutura

```txt
Ícone
Título curto
Texto explicativo
CTA principal opcional
```

### Exemplo

```txt
Nenhum produto cadastrado
Adicione seu primeiro item para começar a controlar seu estoque offline.
[Adicionar produto]
```

---

## 14.7. StatusBadge

### Uso

Exibir status de estoque.

### Variantes

```ts
type StockStatus =
  | 'healthy'
  | 'low'
  | 'zero'
  | 'expiring'
  | 'expired'
  | 'archived';
```

---

## 14.8. MetricCard

### Uso

Dashboard e relatórios.

### Estrutura

```txt
Título
Valor principal
Variação ou subtítulo
Ícone opcional
```

### Exemplos

- Total em estoque.
- Produtos cadastrados.
- Itens com estoque baixo.
- Valor estimado.

---

## 14.9. ProductRow

### Uso

Lista de produtos.

### Elementos

- nome;
- categoria;
- quantidade atual;
- badge de status;
- valor opcional;
- seta ou ação rápida.

### Regra

A linha deve ser legível mesmo com nomes grandes.

---

## 14.10. PremiumLock

### Uso

Bloquear recursos avançados.

### Elementos

```txt
Ícone premium
Título claro
Benefício do recurso
Opção de assistir anúncio
Opção de continuar sem liberar
```

### Regra

Não bloquear função básica do app com PremiumLock.

---

## 14.11. RewardedAdCard

### Uso

Mostrar benefício de assistir anúncio.

### Variações

```ts
type RewardedAdType =
  | 'temporary_ad_free'
  | 'feature_unlock';
```

### Regras

- Deve explicar a recompensa antes do anúncio.
- Deve mostrar duração ou quantidade de usos.
- Deve permitir recusar.
- Não deve parecer compra premium.

---

## 14.12. ConfirmDialog

### Uso

Ações críticas:

- excluir produto;
- apagar dados;
- restaurar backup;
- sobrescrever banco;
- remover categoria com produtos vinculados.

### Regras

- Título direto.
- Explicação curta.
- Botão destrutivo em vermelho.
- Botão cancelar visível.

---

# 15. Componentes por domínio

## 15.1. Dashboard

Local:

```txt
src/components/dashboard/
```

Componentes:

```txt
InventorySummaryCard
LowStockCard
RecentMovementsCard
QuickActionsGrid
AdFreeStatusCard
```

## 15.2. Produtos

Local:

```txt
src/components/products/
```

Componentes:

```txt
ProductRow
ProductForm
ProductQuantityCard
ProductStatusBadge
ProductMovementSheet
ProductFilterBar
```

## 15.3. Relatórios

Local:

```txt
src/components/reports/
```

Componentes:

```txt
ReportMetricCard
ReportPeriodSelector
ExportOptionsCard
PremiumReportLock
```

## 15.4. Ads e recompensas

Local:

```txt
src/components/ads/
```

Componentes:

```txt
RewardedAdCard
FeatureUnlockModal
AdFreeTimerBadge
RewardUnavailableState
```

## 15.5. Configurações

Local:

```txt
src/components/settings/
```

Componentes:

```txt
SettingsRow
ThemeSelector
LanguageSelector
SecuritySettingsCard
BackupSettingsCard
```

---

# 16. Navegação

## 16.1. Bottom tabs

Tabs principais:

```txt
Dashboard
Produtos
Alertas
Relatórios
Configurações
```

## 16.2. Regra para tabs

- Máximo de 5 tabs.
- Texto curto.
- Ícone claro.
- Badge apenas em Alertas.
- Não colocar Premium como tab principal.
- Premium deve ser tela acessada por bloqueios, configurações ou cards.

## 16.3. Ícones sugeridos

| Tela | Ícone conceitual |
|---|---|
| Dashboard | gráfico/painel |
| Produtos | caixa/cubo |
| Alertas | sino/triângulo |
| Relatórios | documento/gráfico |
| Configurações | engrenagem |

---

# 17. Telas e direção visual

## 17.1. Onboarding

### Estilo

- poucas etapas;
- visual premium;
- foco em confiança;
- linguagem clara;
- sem anúncios.

### Telas

```txt
01_onboarding_welcome
02_onboarding_usage_type
03_onboarding_preferences
04_onboarding_security
```

### Regras

- Não mostrar banner.
- Não pedir login.
- Não exigir cadastro longo.
- Permitir pular configurações avançadas.

---

## 17.2. Dashboard

### Objetivo

Dar visão rápida do estoque e caminhos de ação.

### Elementos obrigatórios

- saudação ou título;
- resumo do estoque;
- alerta principal;
- ações rápidas;
- últimas movimentações;
- estado de anúncio removido, se ativo.

### CTA principal

```txt
Adicionar produto
```

### Ações secundárias

```txt
Entrada rápida
Saída rápida
```

---

## 17.3. Produtos

### Objetivo

Permitir encontrar, filtrar e gerenciar produtos.

### Elementos obrigatórios

- busca;
- filtros;
- lista;
- status de estoque;
- CTA para adicionar produto.

### Estado vazio

Mostrar CTA forte para cadastrar primeiro item.

---

## 17.4. Produto detalhe

### Objetivo

Visualizar e movimentar um produto específico.

### Elementos obrigatórios

- nome;
- quantidade atual;
- status;
- categoria;
- custo/preço se habilitado;
- ações de entrada/saída;
- histórico recente.

### CTA principal

```txt
Movimentar estoque
```

---

## 17.5. Entrada/Saída

### Objetivo

Registrar movimentação de forma rápida e segura.

### Regras

- Mostrar quantidade atual antes da operação.
- Mostrar nova quantidade prevista.
- Impedir saída maior que estoque, exceto ajuste autorizado.
- Confirmar perdas e ajustes críticos.

---

## 17.6. Alertas

### Objetivo

Mostrar o que exige ação.

### Tipos

- estoque baixo;
- estoque zerado;
- vencendo;
- vencido;
- produtos sem categoria;
- produtos sem custo, se relatório financeiro estiver ativo.

### Regra

Cada alerta deve ter uma ação clara.

---

## 17.7. Relatórios

### Objetivo

Transformar movimentações em informação útil.

### V1

- resumo por período;
- entradas;
- saídas;
- perdas;
- valor estimado;
- exportação básica.

### Recursos bloqueados por reward/premium

- PDF avançado;
- CSV;
- análise de margem;
- histórico avançado.

---

## 17.8. Configurações

### Objetivo

Concentrar ajustes do app.

### Grupos

```txt
Preferências
Segurança
Dados e backup
Anúncios e recompensas
Privacidade
Sobre o app
```

---

# 18. Formulários

## 18.1. Cadastro de produto

### Campos principais

```txt
Nome do produto
Quantidade inicial
Quantidade mínima
Unidade
Categoria
Custo
Preço de venda
Código de barras
Validade
Fornecedor
Localização
Observações
```

### Regras visuais

- Dividir por seções.
- Campos obrigatórios no topo.
- Valores financeiros em seção separada.
- Informações avançadas recolhíveis.

### Campos obrigatórios na V1

```txt
Nome
Quantidade inicial
Quantidade mínima
Unidade
```

---

## 18.2. Movimentação

### Campos

```txt
Tipo
Quantidade
Motivo
Data
Custo opcional
Observação
```

### Regras

- Mostrar prévia do resultado.
- Usar cores diferentes para entrada e saída.
- Confirmar operações destrutivas.

---

# 19. Estados visuais

Toda tela importante deve prever:

```txt
carregando
vazio
erro
sucesso
sem permissão
recurso bloqueado
sem internet
```

## 19.1. Loading

Usar skeletons simples em listas e cards.

## 19.2. Erro

Mensagens curtas e acionáveis.

Exemplo:

```txt
Não foi possível carregar os produtos.
[Tentar novamente]
```

## 19.3. Offline

Como o app é offline-first, ausência de internet não deve ser tratada como erro geral.

Mostrar aviso apenas quando tentar:

- carregar anúncio;
- validar consentimento;
- abrir link externo;
- verificar atualização;
- restaurar backup em nuvem futura.

---

# 20. Regras para anúncios

## 20.1. Linguagem visual

Anúncios e recompensas devem parecer uma **opção**, não uma punição.

## 20.2. Cores

Usar:

```txt
premium
premiumSoft
accent
```

Não usar vermelho para anúncios, exceto erro.

## 20.3. Card de remover anúncios temporariamente

### Estrutura

```txt
Use sem anúncios por 1 hora
Assista a um anúncio curto e remova banners temporariamente.
[Assistir anúncio]
```

## 20.4. Card de liberar função

### Estrutura

```txt
Liberar recurso avançado
Assista a um anúncio premiado e use esta função por 24 horas.
[Assistir e liberar]
[Agora não]
```

## 20.5. Regras obrigatórias

- Sempre explicar a recompensa antes.
- Sempre permitir recusar.
- Nunca mostrar anúncio no onboarding.
- Nunca mostrar anúncio antes de salvar dados.
- Nunca interromper cadastro de produto.
- Nunca cobrir botão principal.
- Nunca impedir acesso às funções básicas.

---

# 21. Recursos premium/recompensa

## 21.1. Visual de recurso bloqueado

Usar componente:

```txt
PremiumLock
```

### Conteúdo

```txt
Ícone
Título
Benefício
Duração da liberação por anúncio
Botão de assistir
Botão de recusa
```

## 21.2. Badge de recurso liberado

Quando ativo:

```txt
Liberado por 24h
```

ou:

```txt
3 usos restantes
```

## 21.3. Regra visual

Não usar cadeado agressivo em excesso. O usuário deve entender que existe alternativa, não bloqueio total.

---

# 22. Segurança visual

## 22.1. Dados financeiros

Quando `hideFinancialValues = true`, valores devem aparecer assim:

```txt
••••••
```

## 22.2. Ações críticas

Ações críticas exigem confirmação:

- excluir produto;
- apagar histórico;
- restaurar backup;
- apagar banco;
- alterar criptografia;
- desativar bloqueio do app.

## 22.3. Mensagens de segurança

Tom visual:

```txt
claro, direto, sem alarmismo
```

Exemplo:

```txt
Este backup contém seus dados de estoque. Guarde o arquivo em local seguro.
```

---

# 23. Internacionalização visual

## 23.1. Idiomas iniciais

```txt
pt-BR
en
es
```

## 23.2. Regras de layout para múltiplos idiomas

- Botões devem aceitar textos maiores.
- Evitar largura fixa em textos.
- Cards devem crescer verticalmente.
- Usar `numberOfLines` apenas em listas.
- Não colocar texto importante cortado.
- Evitar frases longas em tabs.

## 23.3. Tamanho mínimo de componentes

Botões devem ter altura mínima de `48px` para acomodar traduções.

---

# 24. Acessibilidade

## 24.1. Contraste

- Texto principal deve ter contraste alto.
- Badges não podem depender apenas de cor.
- Estados devem usar texto + cor.

## 24.2. Toque

Área mínima recomendada:

```txt
44x44px
```

## 24.3. Leitores de tela

Botões importantes devem ter labels descritivos.

Exemplo:

```txt
Adicionar novo produto ao estoque
```

## 24.4. Texto dinâmico

Componentes devem tolerar aumento moderado de fonte.

---

# 25. Ícones

## 25.1. Estilo

- outline ou duotone leve;
- espessura consistente;
- sem excesso de detalhes;
- compatível com tema escuro.

## 25.2. Biblioteca sugerida

```txt
lucide-react-native
```

## 25.3. Regras

- Ícone não substitui texto em ações críticas.
- Ícone de alerta deve ter label.
- Ícones decorativos devem ser discretos.

---

# 26. Microcopy

## 26.1. Tom de voz

O app deve falar de forma:

- direta;
- profissional;
- simples;
- útil;
- sem exagero comercial.

## 26.2. Exemplos bons

```txt
Adicionar produto
Registrar entrada
Registrar saída
Estoque baixo
Produto vencendo
Exportar relatório
Backup criado com sucesso
```

## 26.3. Exemplos ruins

```txt
Uau! Seu estoque está incrível!
Clique aqui agora mesmo!
Ganhe vantagens imperdíveis!
```

---

# 27. Animações

## 27.1. Uso permitido

- feedback de botão;
- abertura de bottom sheet;
- atualização de métricas;
- transição suave entre telas;
- destaque discreto em alerta novo.

## 27.2. Evitar

- animação longa;
- animação em excesso no dashboard;
- movimento em formulários críticos;
- efeito chamativo em anúncio.

## 27.3. Duração recomendada

```txt
150ms a 250ms
```

---

# 28. Feedbacks

## 28.1. Sucesso

Usar toast ou snackbar curto.

Exemplo:

```txt
Produto salvo com sucesso.
```

## 28.2. Erro

Mostrar mensagem acionável.

Exemplo:

```txt
Não foi possível salvar. Verifique os dados e tente novamente.
```

## 28.3. Operações críticas

Usar modal de confirmação, não toast.

---

# 29. Backup e restauração

## 29.1. Visual

A área de backup deve parecer segura e séria.

## 29.2. Cores

Usar:

- `primary` para exportar;
- `warning` para restaurar;
- `danger` para apagar dados.

## 29.3. Mensagens

Exemplo:

```txt
Restaurar um backup pode substituir os dados atuais deste aparelho.
```

---

# 30. Regras contra redundância

## 30.1. Dashboard

Não repetir a mesma métrica em vários cards.

Exemplo correto:

```txt
Valor total aparece apenas no card financeiro.
Quantidade de produtos aparece apenas no resumo geral.
Alertas aparecem apenas no card de alertas.
```

## 30.2. Produto detalhe

Não mostrar quantidade atual em três lugares diferentes.

Usar:

- destaque principal para quantidade;
- histórico para movimentações;
- badge para status.

## 30.3. Relatórios

Não misturar relatório operacional e financeiro no mesmo card.

---

# 31. Design para telas pequenas

## 31.1. Regras

Em celular pequeno:

- reduzir cards secundários;
- evitar grid de 2 colunas com texto grande;
- usar listas verticais;
- manter CTA principal fixo ou claramente visível;
- evitar formulários com campos lado a lado.

## 31.2. Formulário

Campos em uma coluna.

## 31.3. Dashboard

Métricas principais podem ficar em grid de 2 colunas apenas se o texto couber bem.

---

# 32. Design para tablet

## 32.1. Regras

Em tablet:

- limitar largura de formulários;
- usar grid de cards;
- permitir lista + detalhe em versões futuras;
- não esticar botões para largura absurda;
- manter leitura confortável.

## 32.2. Largura máxima sugerida

```txt
720px para formulários
960px para dashboard
```

---

# 33. Regras de implementação visual

## 33.1. Proibido

- hardcodar cores em telas;
- duplicar componentes de botão;
- criar card local se `AppCard` resolver;
- criar novo padrão visual sem atualizar este documento;
- usar texto fixo fora do i18n;
- criar anúncio sem passar pelo `adsService`;
- bloquear recurso sem `FeatureGate`.

## 33.2. Obrigatório

- usar tokens;
- usar componentes globais;
- respeitar tema claro/escuro;
- respeitar idioma;
- respeitar safe area;
- testar celular pequeno;
- rodar typecheck.

---

# 34. Arquivos recomendados

```txt
src/constants/colors.ts
src/constants/spacing.ts
src/constants/typography.ts
src/constants/radius.ts
src/constants/elevation.ts
src/constants/features.ts

src/hooks/useAppTheme.ts
src/hooks/useThemeMode.ts
src/hooks/useI18n.ts

src/components/ui/ScreenContainer.tsx
src/components/ui/AppHeader.tsx
src/components/ui/AppCard.tsx
src/components/ui/AppButton.tsx
src/components/ui/AppInput.tsx
src/components/ui/EmptyState.tsx
src/components/ui/StatusBadge.tsx
src/components/ui/MetricCard.tsx
src/components/ui/ConfirmDialog.tsx
src/components/ui/PremiumLock.tsx

src/components/ads/RewardedAdCard.tsx
src/components/ads/FeatureUnlockModal.tsx
src/components/ads/AdFreeTimerBadge.tsx
```

---

# 35. Critérios de aceitação do design system

O design system estará pronto quando:

```txt
[ ] tema claro definido
[ ] tema escuro definido
[ ] tokens de cor definidos
[ ] tipografia definida
[ ] espaçamentos definidos
[ ] raios definidos
[ ] componentes globais definidos
[ ] regras de anúncios definidas
[ ] regras de premium/recompensa definidas
[ ] regras de internacionalização definidas
[ ] regras de acessibilidade definidas
[ ] regras de responsividade definidas
[ ] critérios para telas pequenas definidos
[ ] critérios para tablet definidos
[ ] proibições de implementação definidas
```

---

# 36. Prompt seguro para Codex implementar a base visual

Use este prompt após criar este arquivo no projeto:

```md
Você é um dev sênior em Expo, React Native e TypeScript.

Implemente apenas a base visual global do app EstoqueGuard Offline.

Leia antes:
- PROJECT_GUIDE.md
- docs/01_APP_BLUEPRINT.md
- docs/02_DESIGN_SYSTEM.md

Faça:
- tokens de cores para tema claro e escuro;
- tokens de espaçamento;
- tokens de tipografia;
- tokens de raio e elevação;
- hook centralizado de tema;
- suporte a theme mode: system, light e dark;
- componentes globais:
  - ScreenContainer;
  - AppHeader;
  - AppCard;
  - AppButton;
  - AppInput;
  - EmptyState;
  - StatusBadge;
  - MetricCard;
  - ConfirmDialog;
  - PremiumLock.

Regras:
- não implementar telas completas;
- não implementar banco de dados ainda;
- não implementar anúncios ainda;
- não implementar premium ainda;
- não criar funções fora do escopo;
- não hardcodar cores nas telas;
- preservar rotas existentes;
- usar TypeScript sem any desnecessário;
- limpar imports;
- rodar npm run typecheck ao final.

Critérios de aceitação:
- app compila;
- componentes reutilizáveis existem;
- tema claro funciona;
- tema escuro funciona;
- estrutura permite múltiplos idiomas;
- não há lógica de negócio dentro dos componentes visuais;
- typecheck passa.
```

---

# 37. Conclusão

Este design system define a base visual e comportamental do **EstoqueGuard Offline**.

A regra principal é:

```txt
Toda tela deve parecer parte do mesmo sistema: clara, segura, profissional, responsiva, offline-first e compatível com tema claro/escuro e múltiplos idiomas.
```

Nenhuma nova tela deve ser criada sem respeitar estes tokens, componentes e regras.
