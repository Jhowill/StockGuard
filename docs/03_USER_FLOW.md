# 03 — User Flow

## App

**EstoqueGuard Offline**

## Objetivo deste documento

Este documento define a jornada do usuário, os fluxos principais, os estados do app e as regras de navegação do **EstoqueGuard Offline**.

O objetivo é garantir que o app seja implementado de forma controlada, sem telas redundantes, sem bloqueios agressivos por anúncios e sem comprometer a experiência offline.

---

# 1. Princípios do fluxo

## 1.1. Regra principal

O app deve permitir que o usuário faça o controle básico de estoque mesmo:

- sem internet;
- sem login;
- sem assistir anúncios;
- sem ativar premium;
- sem criar conta;
- sem configurar tudo no primeiro acesso.

A experiência inicial deve ser rápida, funcional e segura.

## 1.2. Fluxo local-first

O app deve ser pensado como **offline-first/local-first**.

```txt
Usuário abre o app
→ Dados são lidos do banco local
→ App funciona imediatamente
→ Internet só é usada para anúncios, consentimento e possíveis futuras integrações
```

## 1.3. Regra contra fricção

O app não deve exigir muitas decisões antes do primeiro uso.

O onboarding deve configurar apenas o essencial:

1. idioma;
2. tema;
3. tipo de uso;
4. moeda;
5. segurança opcional.

O restante pode ser ajustado depois em Configurações.

## 1.4. Regra contra anúncios invasivos

Anúncios não podem interromper ações críticas.

Não exibir anúncios:

- durante cadastro de produto;
- antes de salvar entrada ou saída;
- durante edição de dados;
- em telas de erro;
- no primeiro acesso;
- cobrindo CTA principal;
- sem explicação de recompensa.

Anúncios premiados devem ser sempre opcionais.

---

# 2. Estados globais do usuário

## 2.1. Usuário novo

Condição:

```txt
app_settings não existe
ou onboardingCompleted = false
```

Fluxo:

```txt
Abrir app
→ Onboarding
→ Preferências básicas
→ Segurança opcional
→ Dashboard vazio
```

## 2.2. Usuário recorrente sem produtos

Condição:

```txt
onboardingCompleted = true
products.count = 0
```

Fluxo:

```txt
Abrir app
→ Dashboard vazio
→ CTA principal: Adicionar primeiro produto
```

## 2.3. Usuário recorrente com produtos

Condição:

```txt
onboardingCompleted = true
products.count > 0
```

Fluxo:

```txt
Abrir app
→ Dashboard com indicadores
→ Alertas importantes
→ Últimas movimentações
→ CTA principal: Nova movimentação ou Adicionar produto
```

## 2.4. Usuário com app bloqueado por PIN/biometria

Condição:

```txt
appLockEnabled = true
```

Fluxo:

```txt
Abrir app
→ Tela de desbloqueio
→ Biometria ou PIN
→ Dashboard
```

Falha:

```txt
Erro na biometria
→ Permitir tentar novamente
→ Permitir usar PIN
```

## 2.5. Usuário offline

Condição:

```txt
sem conexão com internet
```

Fluxo:

```txt
App continua funcionando normalmente
→ Produtos, estoque, histórico e relatórios locais disponíveis
→ Ads e recompensas indisponíveis
→ Mostrar aviso discreto apenas quando tentar usar anúncio
```

Mensagem sugerida:

```txt
Você está offline. O app continua funcionando, mas anúncios premiados exigem internet.
```

## 2.6. Usuário com recompensa ativa

Condição:

```txt
ad_entitlements possui recompensa válida
```

Fluxo:

```txt
Abrir app
→ Validar recompensas locais
→ Aplicar remoção temporária de anúncios ou liberar recurso temporário
```

## 2.7. Usuário com recompensa expirada

Condição:

```txt
ad_entitlements.expiresAt < now
```

Fluxo:

```txt
Abrir app
→ Marcar recompensa como expirada
→ Voltar estado grátis padrão
→ Não mostrar pop-up agressivo
```

---

# 3. Mapa geral de navegação

## 3.1. Rotas principais

```txt
app/
  _layout.tsx
  onboarding/
    index.tsx
    usage-type.tsx
    preferences.tsx
    security.tsx
    done.tsx
  unlock.tsx
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
    edit.tsx
    movement.tsx
  categories/
    index.tsx
    new.tsx
  suppliers/
    index.tsx
    new.tsx
  reports/
    basic.tsx
    advanced.tsx
    export.tsx
  ads/
    remove-ads.tsx
    unlock-feature.tsx
  backup/
    index.tsx
    export.tsx
    import.tsx
  security/
    pin.tsx
    biometric.tsx
```

## 3.2. Bottom tabs

A navegação principal deve conter 5 abas:

| Aba | Rota | Objetivo |
|---|---|---|
| Início | `(tabs)/index` | visão geral e ações rápidas |
| Produtos | `(tabs)/products` | lista, busca e filtros |
| Alertas | `(tabs)/alerts` | estoque baixo, zerado e vencimentos |
| Relatórios | `(tabs)/reports` | resumos e exportações |
| Ajustes | `(tabs)/settings` | preferências, segurança, backup e anúncios |

## 3.3. Regra de navegação

Telas de cadastro, edição, detalhe, backup, desbloqueio por anúncio e configurações avançadas devem abrir fora das tabs, em stack.

```txt
Tabs = navegação principal
Stack = tarefa específica
Modal = confirmação, recompensa, erro ou aviso curto
```

---

# 4. Fluxo de primeira abertura

## 4.1. Entrada

```txt
Usuário instala e abre o app
→ Verifica idioma do dispositivo
→ Verifica tema do sistema
→ Cria banco local se necessário
→ Executa migrations
→ Abre onboarding
```

## 4.2. Tela 1 — Boas-vindas

### Objetivo

Explicar rapidamente o valor do app.

### Conteúdo

- Nome do app.
- Frase curta sobre controle offline.
- 3 benefícios principais.
- CTA: Começar.

### Exemplo de texto

```txt
Controle seu estoque mesmo sem internet.
Cadastre produtos, registre entradas e saídas, receba alertas e acompanhe tudo no celular.
```

### Ações

| Ação | Resultado |
|---|---|
| Tocar em Começar | Vai para Tipo de uso |

---

## 4.3. Tela 2 — Tipo de uso

### Objetivo

Personalizar levemente a experiência inicial.

### Opções

- Loja.
- Oficina.
- Assistência técnica.
- Prestador de serviço.
- Estoque pessoal/profissional.
- Outro.

### Ações

| Ação | Resultado |
|---|---|
| Escolher tipo | Salva `usageType` localmente |
| Continuar | Vai para Preferências |

---

## 4.4. Tela 3 — Preferências iniciais

### Objetivo

Definir idioma, tema e moeda.

### Campos

| Campo | Opções | Padrão |
|---|---|---|
| Idioma | Sistema, Português, Inglês, Espanhol | Sistema |
| Tema | Sistema, Claro, Escuro | Sistema |
| Moeda | BRL, USD, EUR | BRL no Brasil |

### Ações

| Ação | Resultado |
|---|---|
| Alterar idioma | Atualiza textos imediatamente |
| Alterar tema | Atualiza aparência imediatamente |
| Continuar | Vai para Segurança |

---

## 4.5. Tela 4 — Segurança opcional

### Objetivo

Oferecer proteção sem obrigar o usuário.

### Opções

- Ativar PIN.
- Ativar biometria, se disponível.
- Ocultar valores financeiros.
- Configurar depois.

### Ações

| Ação | Resultado |
|---|---|
| Ativar PIN | Abre criação de PIN |
| Ativar biometria | Solicita biometria do dispositivo |
| Configurar depois | Vai para conclusão |

---

## 4.6. Tela 5 — Conclusão

### Objetivo

Finalizar onboarding e levar para o app.

### Conteúdo

- Confirmação curta.
- CTA: Ir para meu estoque.

### Ações

| Ação | Resultado |
|---|---|
| Ir para meu estoque | Salva `onboardingCompleted = true` e abre Dashboard |

---

# 5. Fluxo do Dashboard

## 5.1. Dashboard sem produtos

### Estado

```txt
products.count = 0
```

### Objetivo

Levar o usuário ao primeiro cadastro.

### Estrutura

1. Header com saudação.
2. Card de estado vazio.
3. CTA principal: Adicionar primeiro produto.
4. Ação secundária: Importar planilha/CSV, se disponível.
5. Dica curta sobre estoque mínimo.

### Ações

| Ação | Resultado |
|---|---|
| Adicionar primeiro produto | Abre `products/new` |
| Importar dados | Abre `backup/import` ou `reports/import` |

---

## 5.2. Dashboard com produtos

### Estado

```txt
products.count > 0
```

### Objetivo

Mostrar visão rápida e permitir ação imediata.

### Indicadores principais

- Total de produtos ativos.
- Itens com estoque baixo.
- Itens zerados.
- Valor estimado do estoque.
- Última movimentação.

### CTA principal

```txt
Nova movimentação
```

### Ações secundárias

- Adicionar produto.
- Ver alertas.

### Fluxo

```txt
Dashboard
→ Usuário vê alertas
→ Toca em Nova movimentação
→ Escolhe produto
→ Define entrada ou saída
→ Salva
→ Retorna ao Dashboard atualizado
```

---

# 6. Fluxo de cadastro de produto

## 6.1. Entrada

Rotas possíveis:

```txt
Dashboard → Adicionar produto
Produtos → Adicionar produto
```

## 6.2. Campos obrigatórios

| Campo | Regra |
|---|---|
| Nome | obrigatório |
| Quantidade inicial | obrigatório, mínimo 0 |
| Unidade | obrigatório |
| Estoque mínimo | obrigatório, mínimo 0 |

## 6.3. Campos opcionais

- SKU.
- Código de barras.
- Categoria.
- Fornecedor.
- Custo unitário.
- Preço de venda.
- Validade.
- Lote.
- Localização.
- Observações.

## 6.4. Fluxo

```txt
Abrir cadastro
→ Preencher dados básicos
→ Opcionalmente preencher dados avançados
→ Salvar
→ Criar produto
→ Criar primeira movimentação do tipo ajuste/entrada inicial
→ Abrir detalhe do produto ou voltar para lista
```

## 6.5. Estados

| Estado | Comportamento |
|---|---|
| Campo obrigatório vazio | Mostrar erro inline |
| Quantidade inválida | Bloquear salvamento |
| Nome duplicado | Alertar, mas permitir se usuário confirmar |
| Sem categoria | Salvar como sem categoria |
| Erro no banco | Mostrar erro e manter dados preenchidos |

---

# 7. Fluxo de lista de produtos

## 7.1. Objetivo

Permitir encontrar produtos rapidamente.

## 7.2. Recursos

- Busca por nome.
- Busca por SKU.
- Busca por código de barras.
- Filtro por categoria.
- Filtro por baixo estoque.
- Filtro por zerado.
- Ordenação por nome, quantidade, atualização e validade.

## 7.3. Fluxo

```txt
Abrir Produtos
→ Carregar lista local
→ Usuário busca ou filtra
→ Toca em produto
→ Abre detalhe
```

## 7.4. Estado vazio

```txt
Nenhum produto cadastrado ainda.
```

CTA:

```txt
Adicionar produto
```

## 7.5. Estado sem resultado de busca

```txt
Nenhum produto encontrado com esse filtro.
```

Ações:

- Limpar filtros.
- Adicionar produto.

---

# 8. Fluxo de detalhe do produto

## 8.1. Objetivo

Mostrar dados completos do produto e permitir movimentação rápida.

## 8.2. Estrutura

1. Nome do produto.
2. Status do estoque.
3. Quantidade atual.
4. Estoque mínimo.
5. Valor estimado.
6. Dados complementares.
7. Histórico recente.
8. CTAs.

## 8.3. CTA principal

```txt
Movimentar estoque
```

## 8.4. Ações secundárias

- Editar.
- Arquivar.
- Ver histórico completo.

## 8.5. Fluxo

```txt
Produtos
→ Detalhe do produto
→ Movimentar estoque
→ Entrada ou saída
→ Salvar
→ Atualizar quantidade
→ Adicionar registro no histórico
→ Voltar ao detalhe atualizado
```

---

# 9. Fluxo de movimentação de estoque

## 9.1. Objetivo

Registrar entrada, saída, perda, retorno ou ajuste com segurança.

## 9.2. Tipos de movimentação

| Tipo | Uso |
|---|---|
| Entrada | compra, reposição, devolução recebida |
| Saída | venda, uso, retirada |
| Perda | vencido, quebrado, extraviado |
| Retorno | produto voltou ao estoque |
| Ajuste positivo | correção manual para cima |
| Ajuste negativo | correção manual para baixo |

## 9.3. Campos

| Campo | Obrigatório |
|---|---|
| Produto | sim |
| Tipo | sim |
| Quantidade | sim |
| Motivo | não |
| Custo unitário | não |
| Observação | não |

## 9.4. Regras

- Quantidade deve ser maior que zero.
- Saída não pode deixar estoque negativo, salvo se o usuário ativar permissão futura.
- Toda movimentação deve registrar quantidade anterior e nova quantidade.
- Não permitir salvar duas vezes por toque duplicado.
- Exibir confirmação para perda e ajuste manual.

## 9.5. Fluxo de entrada

```txt
Selecionar produto
→ Escolher Entrada
→ Informar quantidade
→ Opcionalmente informar custo
→ Salvar
→ Atualizar estoque
→ Registrar histórico
```

## 9.6. Fluxo de saída

```txt
Selecionar produto
→ Escolher Saída
→ Informar quantidade
→ Validar saldo disponível
→ Salvar
→ Atualizar estoque
→ Registrar histórico
```

## 9.7. Erro por saldo insuficiente

Mensagem:

```txt
Quantidade maior que o estoque disponível.
```

Ações:

- Corrigir quantidade.
- Fazer ajuste manual, se permitido.

---

# 10. Fluxo de alertas

## 10.1. Objetivo

Mostrar o que precisa de atenção.

## 10.2. Tipos de alerta

| Alerta | Condição |
|---|---|
| Estoque zerado | quantity = 0 |
| Estoque baixo | quantity <= minQuantity |
| Vencendo | expirationDate dentro do período configurado |
| Vencido | expirationDate < hoje |
| Sem movimentação | produto sem movimento por X dias, função futura |

## 10.3. Fluxo

```txt
Abrir Alertas
→ Ver grupos de alerta
→ Tocar em produto
→ Abrir detalhe
→ Movimentar ou editar
```

## 10.4. Estado sem alertas

```txt
Nenhum alerta no momento.
Seu estoque está dentro dos limites configurados.
```

---

# 11. Fluxo de relatórios

## 11.1. Objetivo

Permitir análise simples do estoque.

## 11.2. Relatórios básicos grátis

- Resumo geral do estoque.
- Produtos com baixo estoque.
- Entradas e saídas recentes.
- Valor estimado do estoque.

## 11.3. Relatórios avançados por recompensa

Podem exigir anúncio premiado ou versão premium futura:

- PDF avançado.
- Exportação CSV.
- Análise de margem.
- Movimentações por período customizado.
- Histórico completo filtrável.

## 11.4. Fluxo grátis

```txt
Abrir Relatórios
→ Ver resumo básico
→ Escolher período simples
→ Ver dados na tela
```

## 11.5. Fluxo avançado com anúncio

```txt
Usuário toca em Exportar PDF avançado
→ App verifica feature gate
→ Se bloqueado, abre tela de recompensa
→ Usuário aceita assistir anúncio
→ Anúncio concluído
→ Libera recurso temporariamente
→ Gera PDF
```

---

# 12. Fluxo de anúncios e recompensas

## 12.1. Remover anúncios temporariamente

### Entrada

```txt
Configurações → Remover anúncios temporariamente
ou Premium/Rewards → Remover anúncios por 1 hora
```

### Fluxo

```txt
Usuário toca em Remover anúncios por 1 hora
→ App verifica internet
→ App verifica limite diário
→ Mostra explicação da recompensa
→ Usuário toca em Assistir anúncio
→ Rewarded Ad é exibido
→ Se concluído, salva recompensa
→ Remove anúncios temporariamente
```

### Falhas

| Falha | Comportamento |
|---|---|
| Sem internet | Informar que precisa de conexão |
| Anúncio indisponível | Pedir para tentar depois |
| Usuário fecha anúncio | Não conceder recompensa |
| Limite diário atingido | Informar limite e manter app funcional |

## 12.2. Liberar recurso temporário

### Entrada

```txt
Usuário toca em recurso avançado bloqueado
```

### Fluxo

```txt
Verificar feature gate
→ Mostrar tela introdutória
→ Explicar recurso e duração
→ Usuário escolhe assistir ou cancelar
→ Rewarded Interstitial é exibido
→ Se concluído, liberar recurso
→ Abrir função solicitada
```

### Regras

- A tela introdutória é obrigatória.
- Deve existir opção clara de cancelar.
- Cancelar não pode prejudicar o uso básico do app.
- A recompensa deve ser entregue exatamente como prometida.
- O app deve registrar expiração ou quantidade restante.

---

# 13. Fluxo de configurações

## 13.1. Objetivo

Centralizar preferências, segurança, backup e monetização.

## 13.2. Seções

| Seção | Itens |
|---|---|
| Aparência | tema claro, escuro, sistema |
| Idioma | sistema, PT-BR, EN, ES |
| Estoque | moeda, unidade padrão, alertas |
| Segurança | PIN, biometria, ocultar valores |
| Dados | backup, restaurar, exportar, apagar tudo |
| Anúncios | remover temporariamente, recompensas ativas |
| Sobre | versão, política, termos |

## 13.3. Fluxo de troca de tema

```txt
Configurações
→ Aparência
→ Escolher Sistema, Claro ou Escuro
→ Atualizar visual imediatamente
→ Salvar em app_settings
```

## 13.4. Fluxo de troca de idioma

```txt
Configurações
→ Idioma
→ Escolher idioma
→ Atualizar textos imediatamente
→ Salvar em app_settings
```

---

# 14. Fluxo de backup e restauração

## 14.1. Backup

### Objetivo

Permitir que o usuário salve seus dados localmente.

### Fluxo

```txt
Configurações
→ Backup
→ Exportar backup
→ Escolher se deseja proteger com senha
→ Gerar arquivo
→ Compartilhar/salvar arquivo
```

### Regras

- Backup deve incluir produtos, categorias, fornecedores, movimentações e configurações relevantes.
- Não exportar chaves internas sensíveis.
- Backup com senha deve ser criptografado.
- Backup sem senha deve avisar que o arquivo pode conter dados comerciais.

## 14.2. Restauração

### Fluxo

```txt
Configurações
→ Backup
→ Restaurar backup
→ Selecionar arquivo
→ Validar estrutura
→ Mostrar resumo do que será restaurado
→ Confirmar
→ Restaurar dados
→ Reabrir Dashboard
```

### Regras

- Validar arquivo antes de importar.
- Não sobrescrever dados sem confirmação.
- Criar backup automático antes de restaurar, se possível.
- Bloquear arquivos incompatíveis.

---

# 15. Fluxo de segurança

## 15.1. Ativar PIN

```txt
Configurações
→ Segurança
→ Ativar PIN
→ Criar PIN
→ Confirmar PIN
→ Salvar hash seguro
→ Ativar bloqueio do app
```

## 15.2. Desativar PIN

```txt
Configurações
→ Segurança
→ Desativar PIN
→ Confirmar PIN atual
→ Desativar bloqueio
```

## 15.3. Ativar biometria

```txt
Configurações
→ Segurança
→ Ativar biometria
→ Verificar disponibilidade
→ Solicitar autenticação
→ Ativar biometria
```

## 15.4. Ocultar valores financeiros

```txt
Configurações
→ Segurança
→ Ocultar valores financeiros
→ Dashboard e relatórios escondem valores
→ Usuário pode tocar para revelar se autenticado
```

---

# 16. Estados técnicos importantes

## 16.1. Carregando

Usar em:

- abertura do banco;
- migrations;
- restauração de backup;
- geração de PDF;
- carregamento de anúncio.

Regra:

```txt
Mostrar estado claro, sem travar o app sem feedback.
```

## 16.2. Erro local

Usar quando:

- falha ao salvar;
- falha ao carregar banco;
- arquivo de backup inválido;
- permissão negada;
- biometria falha.

Regra:

```txt
Mensagem curta + ação possível.
```

## 16.3. Estado vazio

Toda tela de lista precisa ter:

- mensagem curta;
- explicação mínima;
- CTA principal.

## 16.4. Sem permissão

Usar para:

- câmera/código de barras;
- biometria;
- arquivos/backup.

Regra:

```txt
Explicar por que a permissão é necessária e permitir abrir configurações.
```

## 16.5. Sem internet

Usar apenas quando a função realmente precisa de internet:

- anúncios;
- consentimento de anúncios;
- futuras integrações.

Não mostrar alerta global permanente de internet para funções offline.

---

# 17. Regras de feature gate

## 17.1. Verificação centralizada

Nenhuma tela deve fazer verificação manual espalhada.

Usar sempre:

```ts
const { canUseFeature, requestFeatureUnlock } = useFeatureGate();
```

## 17.2. Resultado esperado

```ts
type FeatureGateResult = {
  allowed: boolean;
  reason?: 'free' | 'temporary_reward' | 'premium' | 'locked' | 'expired';
  expiresAt?: string;
  remainingUses?: number;
};
```

## 17.3. Comportamento bloqueado

```txt
Usuário tenta usar recurso avançado
→ App não executa direto
→ Mostra tela PremiumLock/RewardLock
→ Usuário escolhe assistir anúncio ou cancelar
```

## 17.4. Funções nunca bloqueadas

Não bloquear:

- cadastrar produto básico;
- editar produto básico;
- entrada e saída básica;
- visualizar estoque;
- visualizar alertas básicos;
- trocar tema;
- trocar idioma;
- exportação mínima de dados do usuário;
- apagar dados.

---

# 18. Regras de internacionalização no fluxo

## 18.1. Idioma inicial

```txt
Verificar idioma do sistema
→ Se suportado, usar
→ Se não suportado, usar pt-BR como fallback no Brasil ou en como fallback geral
```

## 18.2. Alteração de idioma

```txt
Usuário altera idioma
→ Atualiza interface imediatamente
→ Salva preferência
→ Não exige reiniciar app
```

## 18.3. Textos variáveis

Evitar textos muito longos em botões, pois idiomas como inglês e espanhol podem alterar tamanho.

Botões devem aceitar quebra ou largura flexível.

---

# 19. Regras de tema no fluxo

## 19.1. Tema inicial

```txt
theme = system
```

## 19.2. Alteração de tema

```txt
Usuário escolhe tema
→ Atualiza tokens globais
→ Todos os componentes reagem automaticamente
```

## 19.3. Bloqueio

Nenhuma tela deve ter cores fixas fora dos tokens do design system.

---

# 20. Fluxos críticos que não podem falhar

## 20.1. Salvar produto

Se falhar:

- manter dados preenchidos;
- mostrar erro claro;
- permitir tentar novamente.

## 20.2. Movimentar estoque

Se falhar:

- não alterar quantidade parcialmente;
- não criar histórico incompleto;
- usar transação no banco;
- mostrar erro.

## 20.3. Restaurar backup

Se falhar:

- não corromper banco atual;
- abortar restauração;
- mostrar erro;
- manter dados anteriores.

## 20.4. Anúncio premiado

Se falhar:

- não conceder recompensa;
- não bloquear app;
- permitir tentar depois.

---

# 21. Jornada diária ideal

```txt
Usuário abre o app
→ Vê resumo do estoque
→ Identifica alertas importantes
→ Registra entrada ou saída
→ Confere atualização automática
→ Fecha o app
```

Tempo ideal para tarefa principal:

```txt
Registrar uma saída de estoque em menos de 20 segundos.
```

---

# 22. Jornada semanal ideal

```txt
Usuário abre Relatórios
→ Confere itens que mais saíram
→ Confere produtos baixos
→ Exporta ou visualiza resumo
→ Planeja reposição
```

---

# 23. Jornada de monetização ideal

```txt
Usuário usa app normalmente
→ Percebe valor real
→ Encontra recurso avançado
→ Escolhe assistir anúncio para liberar temporariamente
→ Recebe recompensa corretamente
→ Continua usando app
```

A monetização deve parecer uma troca justa, não uma punição.

---

# 24. Métricas internas de sucesso

Mesmo sem servidor, o app pode calcular localmente:

- produtos cadastrados;
- movimentações por semana;
- alertas resolvidos;
- frequência de abertura;
- relatórios gerados;
- recompensas ativadas;
- recursos avançados usados;
- tempo desde última movimentação.

Essas métricas devem ser locais na V1.

---

# 25. Critérios de aceitação do fluxo

O fluxo do app será considerado pronto quando:

```txt
[ ] primeiro acesso abre onboarding
[ ] onboarding salva preferências
[ ] usuário consegue pular segurança inicial
[ ] dashboard vazio tem CTA claro
[ ] usuário consegue cadastrar produto
[ ] usuário consegue registrar entrada
[ ] usuário consegue registrar saída
[ ] estoque é atualizado corretamente
[ ] histórico é criado automaticamente
[ ] alertas aparecem quando necessário
[ ] tema claro funciona em todas as telas
[ ] tema escuro funciona em todas as telas
[ ] troca de idioma atualiza o app
[ ] funções básicas funcionam offline
[ ] anúncios só aparecem por escolha ou em locais permitidos
[ ] rewarded ad remove anúncios temporariamente
[ ] rewarded interstitial libera recurso temporariamente
[ ] cancelar anúncio não quebra a jornada
[ ] backup não sobrescreve dados sem confirmação
[ ] PIN/biometria não prende o usuário fora do app sem alternativa
```

---

# 26. O que o Codex não deve fazer nesta fase

Ao implementar com base neste fluxo, o Codex não deve:

- criar login obrigatório;
- criar sincronização em nuvem;
- criar painel web;
- criar multiusuário;
- bloquear funções essenciais por anúncio;
- espalhar lógica de premium nas telas;
- hardcodar textos fora do i18n;
- hardcodar cores fora do design system;
- acessar banco diretamente dentro dos componentes visuais;
- alterar rotas sem atualizar este documento;
- implementar telas fora da V1 sem aprovação.

---

# 27. Próxima etapa recomendada

Depois deste arquivo, criar:

```txt
docs/04_SCREEN_SPECS.md
```

Antes disso, recomenda-se criar ou revisar:

```txt
docs/05_DATA_MODEL.md
```

Como este app depende fortemente de banco local, segurança, anúncios e feature gates, o modelo de dados deve estar bem definido antes das especificações finais das telas.
