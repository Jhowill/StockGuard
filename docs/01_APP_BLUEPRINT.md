# 01 — App Blueprint

## Nome provisório

**EstoqueGuard Offline**

## Nomes alternativos

| Opção | Estilo | Observação |
|---|---|---|
| EstoqueGuard Offline | Profissional e seguro | Melhor opção inicial para V1 |
| EstoquePro Offline | Direto e comercial | Fácil de entender no Brasil |
| StockGuard | Internacional | Bom para app multilíngue |
| Inventra | Marca mais moderna | Nome curto e memorável |
| ControleMax Estoque | Popular e objetivo | Forte para busca em loja |

## Categoria

**Produtividade / Negócios / Controle de Estoque**

## Plataforma

- Android
- iOS
- Preparado para tablets, mas mobile-first

## Stack desejada

```txt
Expo
React Native
TypeScript
Expo Router
SQLite local
SQLCipher para criptografia do banco local
Expo SecureStore para chaves sensíveis
AdMob para anúncios
Rewarded Ads
Rewarded Interstitial Ads
expo-localization + i18n
EAS Build
```

---

# 1. Visão do produto

## Descrição curta

Aplicativo offline para controle de estoque, criado para pequenos negócios, autônomos e prestadores de serviço que precisam cadastrar produtos, controlar entradas e saídas, receber alertas e gerar relatórios sem depender de internet.

## Explicação em uma frase

**EstoqueGuard Offline ajuda pequenos negócios e autônomos a controlar produtos, entradas, saídas, alertas e relatórios por meio de um sistema local, seguro, offline e fácil de usar.**

## Promessa principal

Permitir que o usuário tenha controle real do estoque no celular, mesmo sem internet, com segurança, rapidez e uma experiência profissional.

## Diferencial principal

O app não é apenas uma lista de produtos. Ele funciona como um **mini sistema profissional de estoque offline**, com histórico, alertas, relatórios, proteção local, tema claro/escuro, vários idiomas e monetização por anúncios premiados sem bloquear o uso essencial.

---

# 2. Público-alvo

## Público primário

- Pequenas lojas.
- Oficinas.
- Assistências técnicas.
- MEIs.
- Autônomos.
- Vendedores independentes.
- Prestadores de serviço.
- Pequenos estoques domésticos com uso profissional.

## Público secundário

- Usuários que ainda controlam estoque por planilha.
- Pessoas que não querem sistema com mensalidade.
- Usuários que trabalham em locais com internet instável.
- Pequenos negócios que precisam de controle rápido pelo celular.

## Perfil de uso

O usuário típico precisa:

- cadastrar produtos rapidamente;
- saber quanto tem em estoque;
- saber o que está acabando;
- registrar entrada e saída sem complicação;
- consultar histórico;
- exportar informações;
- proteger dados comerciais;
- usar o app mesmo sem internet.

---

# 3. Problema principal

Pequenos negócios perdem dinheiro e organização porque não têm controle simples e confiável de estoque. Muitos ainda usam papel, bloco de notas, WhatsApp ou planilhas manuais, o que causa:

- perda de produtos;
- compra duplicada;
- falta de produtos importantes;
- esquecimento de vencimentos;
- erro em entradas e saídas;
- falta de histórico;
- dificuldade para saber o valor total em estoque;
- dependência de internet em sistemas online;
- baixa segurança sobre dados comerciais.

---

# 4. Objetivo do app

Criar um app mobile robusto, seguro e offline para controle de estoque, com foco em:

1. cadastro rápido de produtos;
2. movimentações confiáveis de entrada e saída;
3. alertas automáticos;
4. histórico rastreável;
5. relatórios úteis;
6. proteção dos dados locais;
7. monetização por anúncios premiados sem prejudicar a função principal;
8. suporte nativo a tema claro/escuro;
9. suporte inicial a múltiplos idiomas.

---

# 5. Princípios do produto

## 5.1. Offline primeiro

O app deve funcionar sem internet para as funções principais.

Funções que devem funcionar offline:

- abrir app;
- ver produtos;
- cadastrar produto;
- editar produto;
- registrar entrada;
- registrar saída;
- ver histórico;
- ver alertas locais;
- acessar configurações;
- trocar tema;
- trocar idioma;
- exportar backup local se não depender de serviço externo.

Funções que podem depender de internet:

- carregar anúncios;
- validar campanhas de anúncio;
- envio futuro para nuvem, se existir em versões posteriores;
- atualização de conteúdos remotos, se existir.

## 5.2. Segurança por padrão

Dados comerciais devem ser tratados como sensíveis. O app deve proteger:

- produtos;
- custos;
- preços;
- margens;
- fornecedores;
- histórico de movimentação;
- relatórios;
- backups.

## 5.3. Monetização sem agressividade

Anúncios devem ser uma camada de recompensa, não uma barreira para o uso básico.

O usuário deve conseguir usar o app mesmo sem assistir anúncios.

## 5.4. Simplicidade operacional

O app deve ser robusto internamente, mas simples visualmente.

O usuário não deve sentir que está usando um ERP complexo.

## 5.5. Crescimento controlado

A V1 deve resolver controle de estoque local. Recursos como multiusuário, nuvem, painel web e integração fiscal ficam fora da primeira versão.

---

# 6. Funções essenciais da V1

## 6.1. Produtos

O usuário deve conseguir:

- cadastrar produto;
- editar produto;
- arquivar produto;
- buscar produto;
- filtrar produtos;
- definir categoria;
- definir unidade de medida;
- definir quantidade atual;
- definir estoque mínimo;
- definir custo;
- definir preço de venda;
- definir localização interna;
- adicionar observações;
- adicionar código de barras manualmente.

## 6.2. Entradas de estoque

O usuário deve conseguir registrar:

- compra;
- reposição;
- devolução;
- ajuste positivo;
- entrada manual.

Cada entrada deve salvar:

- produto;
- quantidade;
- quantidade anterior;
- nova quantidade;
- data e hora;
- motivo;
- custo unitário opcional;
- observação opcional.

## 6.3. Saídas de estoque

O usuário deve conseguir registrar:

- venda;
- uso interno;
- perda;
- descarte;
- ajuste negativo;
- saída manual.

Cada saída deve salvar:

- produto;
- quantidade;
- quantidade anterior;
- nova quantidade;
- data e hora;
- motivo;
- valor opcional;
- observação opcional.

## 6.4. Dashboard

A tela inicial deve mostrar:

- total de produtos ativos;
- produtos com estoque baixo;
- produtos zerados;
- valor estimado em estoque;
- últimas movimentações;
- CTA principal para adicionar produto ou movimentar estoque;
- alerta rápido de itens críticos.

## 6.5. Alertas

Alertas locais:

- estoque baixo;
- estoque zerado;
- produto vencendo;
- produto vencido;
- produto sem movimentação recente;
- alto volume de perda/descarte.

## 6.6. Histórico

O histórico deve registrar toda alteração importante:

- criação de produto;
- edição de produto;
- entrada;
- saída;
- ajuste manual;
- arquivamento;
- restauração;
- importação;
- exportação;
- backup.

## 6.7. Relatórios

Relatórios da V1:

- resumo geral do estoque;
- produtos com estoque baixo;
- movimentações por período;
- entradas por período;
- saídas por período;
- perdas por período;
- valor estimado em estoque;
- exportação simples em CSV;
- PDF simples ou avançado conforme feature gate.

## 6.8. Configurações

A tela de configurações deve permitir:

- alterar idioma;
- alterar tema;
- alterar moeda;
- ativar/desativar bloqueio por PIN;
- ativar/desativar biometria quando disponível;
- ocultar valores financeiros;
- exportar backup;
- importar backup;
- apagar todos os dados;
- acessar política de privacidade;
- acessar termos de uso;
- acessar tela de anúncios/recompensas.

---

# 7. Tema claro e escuro

## Requisito

O app deve nascer com suporte completo a:

```txt
system
light
dark
```

## Regra

Nenhuma tela deve usar cor fixa diretamente. Todas as cores devem vir de tokens do design system.

## Configuração inicial

No primeiro acesso, o app deve usar o tema do sistema do aparelho.

## Tela de configurações

O usuário pode escolher:

- usar tema do dispositivo;
- sempre claro;
- sempre escuro.

## Critérios de aceite

- todos os textos legíveis nos dois temas;
- cards com contraste adequado;
- botões com hierarquia clara;
- alertas com cores consistentes;
- gráficos e badges legíveis;
- nenhum fundo branco fixo no modo escuro;
- nenhum texto escuro fixo sobre fundo escuro.

---

# 8. Sistema multilíngue

## Idiomas iniciais

```txt
pt-BR
en
es
```

## Regra principal

Nenhum texto fixo deve ficar dentro das telas. Todo texto deve usar chaves de tradução.

Exemplo correto:

```tsx
<Text>{t('products.addProduct')}</Text>
```

Exemplo proibido:

```tsx
<Text>Adicionar produto</Text>
```

## Seleção de idioma

No primeiro acesso:

1. detectar idioma do dispositivo;
2. se for suportado, usar automaticamente;
3. se não for suportado, usar `pt-BR` como fallback para versão brasileira;
4. permitir troca manual nas configurações.

## Chaves principais

Estrutura recomendada:

```txt
src/i18n/
  index.ts
  locales/
    pt-BR.json
    en.json
    es.json
```

Categorias de chaves:

```txt
common.*
onboarding.*
home.*
products.*
movements.*
alerts.*
reports.*
ads.*
premium.*
settings.*
security.*
backup.*
errors.*
```

---

# 9. Monetização com anúncios

## Estratégia geral

O app terá anúncios, mas com controle rígido para não prejudicar a função principal.

Existem dois sistemas de recompensa:

1. assistir anúncio para remover anúncios por pouco tempo;
2. assistir intersticial premiado para liberar funções avançadas temporariamente.

## 9.1. Sistema 1 — Remover anúncios temporariamente

### Nome do sistema

```txt
TemporaryAdFreeReward
```

### Objetivo

Permitir que o usuário assista a um anúncio premiado e remova anúncios comuns por um período curto.

### Recompensa inicial

```txt
Remover anúncios por 1 hora
```

### Regras

- O usuário precisa escolher assistir.
- O app deve explicar a recompensa antes do anúncio.
- A recompensa só é entregue se o anúncio for concluído.
- A remoção de anúncios deve ser temporária.
- A recompensa pode acumular até um limite.
- A V1 deve limitar o acúmulo a 3 horas.
- A V1 deve limitar o uso a 5 vezes por dia.
- Se o anúncio falhar, o app não deve travar.
- Se o usuário estiver offline, mostrar mensagem informando que anúncios precisam de internet.

### Telas onde pode aparecer

- Configurações.
- Tela Premium/Recompensas.
- Banner discreto após uso prolongado.

### Telas onde não pode aparecer

- Primeira tela do onboarding.
- Tela de cadastro durante preenchimento.
- Momento de salvar produto.
- Momento de registrar entrada ou saída.
- Sobre botão principal.

## 9.2. Sistema 2 — Intersticial premiado para liberar recursos

### Nome do sistema

```txt
FeaturePassReward
```

### Objetivo

Permitir que o usuário desbloqueie recursos avançados por tempo limitado ou quantidade limitada de usos.

### Regras

- Usar apenas quando o usuário tentar acessar recurso avançado.
- Mostrar tela introdutória antes do anúncio.
- Explicar claramente qual recurso será liberado.
- Exibir opção de recusa.
- Não impedir que o usuário volte ao uso básico.
- Entregar a recompensa somente após conclusão válida do anúncio.
- Salvar o desbloqueio localmente.
- Validar expiração a cada abertura do app.

### Recursos que podem ser liberados por anúncio

| Feature key | Recurso | Recompensa sugerida |
|---|---|---|
| advanced_pdf_reports | PDF avançado | 24 horas |
| csv_export | Exportação CSV | 3 exportações |
| barcode_scanner | Leitor de código de barras | 10 leituras |
| encrypted_backup | Backup criptografado | 1 backup |
| profit_analysis | Análise de lucro/margem | 24 horas |
| advanced_history | Histórico avançado | 24 horas |
| unlimited_categories | Categorias ilimitadas | 24 horas |
| batch_expiration_control | Controle por lote/validade | 24 horas |

### Recursos que não devem ser bloqueados por anúncios

- abrir app;
- ver dashboard;
- cadastrar produto básico;
- editar produto;
- registrar entrada;
- registrar saída;
- ver alertas básicos;
- ver histórico básico;
- trocar idioma;
- trocar tema;
- acessar configurações;
- apagar dados;
- exportar backup básico do usuário, se exigido por segurança/portabilidade.

---

# 10. Funções grátis

A versão gratuita deve permitir uso real do app.

## Gratuito na V1

- onboarding;
- tema claro/escuro;
- idioma PT/EN/ES;
- cadastro de produtos;
- edição de produtos;
- arquivamento de produtos;
- categorias básicas;
- entrada de estoque;
- saída de estoque;
- dashboard;
- alertas básicos;
- histórico básico;
- configurações;
- backup básico;
- anúncios;
- rewarded ad para remover anúncios temporariamente;
- rewarded interstitial para liberar recursos avançados temporariamente.

## Limites possíveis na versão grátis

Limites sugeridos, sem prejudicar demais o usuário:

- até 100 produtos ativos;
- até 5 categorias;
- histórico básico dos últimos 30 dias;
- relatório simples;
- exportação limitada;
- banners discretos em telas secundárias.

---

# 11. Funções avançadas liberáveis

Estas funções podem ser liberadas por anúncio premiado ou futuramente por compra premium.

- produtos ilimitados;
- categorias ilimitadas;
- relatórios PDF avançados;
- exportação CSV avançada;
- análise de lucro;
- margem por produto;
- histórico completo;
- leitor de código de barras;
- backup criptografado;
- controle por lote;
- controle de validade avançado;
- filtros avançados;
- ocultar anúncios permanentemente, se futuramente houver compra.

---

# 12. Segurança

## 12.1. Dados protegidos

O app pode armazenar informações comerciais importantes:

- nome de produtos;
- quantidade em estoque;
- custo;
- preço;
- fornecedores;
- histórico de venda/uso/perda;
- valor estimado em estoque;
- relatórios;
- backups.

## 12.2. Regras de proteção

- Banco local deve ser isolado por app.
- Banco final deve usar criptografia quando a stack permitir.
- Chaves sensíveis não devem ficar hardcoded.
- Chaves devem ser salvas em armazenamento seguro.
- O app deve ter opção de PIN.
- O app deve ter opção de biometria.
- Backups devem poder ser criptografados.
- Logs não devem expor dados sensíveis.
- Exclusões importantes devem pedir confirmação.
- Ação de apagar todos os dados deve ter confirmação dupla.

## 12.3. Auditoria local

Toda ação crítica deve gerar log local:

- criação de produto;
- edição de produto;
- arquivamento;
- entrada;
- saída;
- ajuste manual;
- importação;
- exportação;
- backup;
- restauração;
- alteração de segurança.

## 12.4. Princípio de dados

```txt
O usuário é dono dos próprios dados.
O app funciona offline.
Nenhuma função essencial depende de servidor.
Anúncios liberam recompensas temporárias, não acesso permanente a dados.
```

---

# 13. Telas da V1

## 13.1. Onboarding — Boas-vindas

### Objetivo

Explicar rapidamente que o app controla estoque offline.

### Conteúdo

- nome do app;
- promessa principal;
- 3 benefícios curtos;
- botão para começar.

## 13.2. Onboarding — Tipo de uso

### Objetivo

Entender o perfil do usuário.

### Opções

- loja;
- oficina;
- assistência técnica;
- estoque pessoal;
- prestação de serviço;
- outro.

## 13.3. Onboarding — Preferências

### Objetivo

Configurar idioma, moeda e tema.

### Campos

- idioma;
- moeda;
- tema.

## 13.4. Onboarding — Segurança

### Objetivo

Oferecer PIN/biometria sem obrigar.

### Opções

- ativar PIN agora;
- ativar depois;
- ativar biometria se disponível.

## 13.5. Dashboard

### Objetivo

Dar visão geral e ação rápida.

### Elementos

- saudação/título;
- valor estimado em estoque;
- produtos ativos;
- produtos baixos;
- produtos zerados;
- últimas movimentações;
- CTA principal: adicionar produto ou movimentar estoque;
- cards de alerta.

## 13.6. Produtos

### Objetivo

Listar e encontrar produtos rapidamente.

### Elementos

- busca;
- filtros;
- lista de produtos;
- badge de estoque;
- badge de alerta;
- botão adicionar.

## 13.7. Adicionar/Editar Produto

### Objetivo

Cadastrar produto completo sem parecer complexo.

### Campos essenciais

- nome;
- categoria;
- quantidade;
- unidade;
- estoque mínimo;
- custo;
- preço;
- código de barras;
- validade;
- localização;
- observação.

## 13.8. Detalhe do Produto

### Objetivo

Mostrar dados do produto e permitir movimentação.

### Elementos

- nome;
- quantidade atual;
- status;
- custo/preço;
- alertas;
- botões entrada/saída;
- histórico recente;
- editar;
- arquivar.

## 13.9. Entrada/Saída

### Objetivo

Registrar movimentação de forma rápida e segura.

### Elementos

- produto selecionado;
- tipo de movimentação;
- quantidade;
- motivo;
- observação;
- prévia da nova quantidade;
- botão salvar.

## 13.10. Alertas

### Objetivo

Concentrar problemas que exigem ação.

### Grupos

- estoque zerado;
- estoque baixo;
- vencendo;
- vencido;
- sem movimentação.

## 13.11. Histórico

### Objetivo

Mostrar rastreabilidade do estoque.

### Filtros

- período;
- produto;
- tipo;
- entrada;
- saída;
- ajuste;
- perda.

## 13.12. Relatórios

### Objetivo

Gerar resumo e exportações.

### Relatórios

- resumo geral;
- estoque baixo;
- movimentações;
- entradas;
- saídas;
- perdas;
- valor total.

## 13.13. Recompensas/Premium

### Objetivo

Concentrar anúncios premiados e recursos avançados.

### Elementos

- remover anúncios por tempo limitado;
- liberar recurso avançado;
- status de recompensas ativas;
- explicação clara;
- opção de continuar grátis.

## 13.14. Backup

### Objetivo

Permitir segurança e portabilidade dos dados.

### Ações

- exportar backup;
- importar backup;
- exportar CSV;
- exportar PDF quando liberado;
- restaurar backup.

## 13.15. Configurações

### Objetivo

Centralizar preferências e segurança.

### Itens

- tema;
- idioma;
- moeda;
- PIN;
- biometria;
- ocultar valores financeiros;
- anúncios/recompensas;
- backup;
- privacidade;
- termos;
- apagar dados.

---

# 14. Jornada principal

## Primeiro acesso

```txt
Usuário abre o app
→ vê boas-vindas
→ escolhe tipo de uso
→ define idioma/moeda/tema
→ escolhe segurança
→ chega ao dashboard vazio
→ adiciona primeiro produto
```

## Uso diário

```txt
Usuário abre o app
→ vê dashboard
→ identifica alertas
→ registra entrada ou saída
→ consulta produtos
→ fecha o app
```

## Uso com alerta

```txt
Usuário abre o app
→ vê card de estoque baixo
→ toca no alerta
→ abre produto crítico
→ registra entrada ou ajusta estoque mínimo
→ alerta é atualizado
```

## Uso de recurso bloqueado

```txt
Usuário tenta exportar PDF avançado
→ app verifica feature gate
→ mostra tela de recompensa
→ usuário assiste anúncio premiado
→ app libera recurso temporariamente
→ usuário exporta relatório
```

---

# 15. Estados importantes

## Usuário novo

- sem produtos;
- dashboard com estado vazio;
- CTA para adicionar primeiro produto;
- dicas simples.

## Usuário recorrente

- dashboard com dados reais;
- últimos movimentos;
- alertas;
- acesso rápido às funções.

## Sem dados

Mostrar EmptyState com:

- ilustração simples;
- texto objetivo;
- CTA principal.

## Sem internet

O app deve continuar funcionando.

Mostrar aviso apenas em recursos online:

- anúncios;
- consentimento;
- eventuais serviços externos futuros.

## Erro de banco

Mostrar mensagem segura:

- não expor SQL;
- oferecer tentar novamente;
- orientar backup/restauração se necessário.

## Recurso bloqueado

Mostrar:

- nome do recurso;
- benefício;
- opção de assistir anúncio;
- opção de voltar;
- status de internet se necessário.

## Recompensa ativa

Mostrar:

- recurso liberado;
- tempo restante;
- usos restantes, se houver.

---

# 16. Modelo de dados inicial — visão de produto

Este blueprint não substitui o arquivo `05_DATA_MODEL.md`, mas define as entidades necessárias.

## Entidades principais

```txt
Product
Category
Supplier
StockMovement
AppSettings
AdEntitlement
AuditLog
BackupRecord
```

## Product

Representa um item de estoque.

Campos principais:

- id;
- name;
- sku;
- barcode;
- categoryId;
- supplierId;
- quantity;
- minQuantity;
- unit;
- costPrice;
- salePrice;
- currency;
- expirationDate;
- batchCode;
- location;
- notes;
- isArchived;
- createdAt;
- updatedAt.

## StockMovement

Representa qualquer alteração de quantidade.

Campos principais:

- id;
- productId;
- type;
- quantity;
- previousQuantity;
- newQuantity;
- reason;
- unitCost;
- totalValue;
- createdAt.

## AdEntitlement

Representa recompensa temporária obtida por anúncio.

Campos principais:

- id;
- type;
- featureKey;
- startedAt;
- expiresAt;
- remainingUses;
- source.

---

# 17. Regras de dados

## Quantidade

- Quantidade nunca deve ser negativa sem regra explícita.
- Saída maior que estoque deve exigir confirmação ou ser bloqueada na V1.
- Toda alteração de quantidade deve criar `StockMovement`.

## Produto

- Produto pode ser arquivado.
- Produto arquivado não aparece por padrão.
- Produto arquivado mantém histórico.
- Exclusão definitiva deve ser evitada na V1.

## Valores

- Valores monetários devem ser salvos em centavos.
- Não usar `float` para dinheiro.
- A moeda padrão deve vir das configurações.

## Histórico

- Histórico não deve ser apagado ao editar produto.
- Histórico deve preservar nome do produto no momento da movimentação ou permitir reconstrução confiável.

## Backup

- Backup deve conter versão do schema.
- Importação deve validar formato.
- Importação não deve sobrescrever tudo sem confirmação.

---

# 18. O que fica fora da V1

Para manter o projeto publicável, ficam fora da primeira versão:

- login obrigatório;
- sincronização em nuvem;
- multiusuário;
- permissões por funcionário;
- painel web;
- emissão fiscal;
- integração com marketplace;
- integração com maquininha;
- leitura automática de nota fiscal;
- IA para previsão de compra;
- notificações push remotas;
- assinatura premium com RevenueCat;
- dashboard financeiro completo;
- CRM de clientes;
- controle de caixa;
- contas a pagar/receber;
- leitor avançado de código de barras com base online;
- integração com impressora.

---

# 19. Riscos de escopo

## Risco 1 — Virar ERP

Controle de estoque pode crescer demais. A V1 não deve tentar ser sistema completo de gestão empresarial.

## Risco 2 — Ads atrapalharem o uso

Anúncios não podem interromper fluxo principal. O usuário precisa confiar no app.

## Risco 3 — Segurança complexa demais no início

Criptografia, PIN, biometria e backup devem ser implementados com ordem. Primeiro banco e dados funcionando, depois segurança avançada.

## Risco 4 — Relatórios grandes demais

Relatórios devem começar simples. PDF avançado pode ser recurso desbloqueável.

## Risco 5 — Multilíngue mal implementado

Se textos ficarem fixos nas telas, depois será caro corrigir. i18n deve entrar desde a base.

## Risco 6 — Tema claro/escuro quebrado

Se componentes usarem cor fixa, o app quebrará visualmente. Usar tokens desde o início.

---

# 20. Métricas de sucesso

## Métricas de produto

- usuário cadastra o primeiro produto sem ajuda;
- usuário registra entrada/saída em menos de 30 segundos;
- usuário entende alertas sem tutorial;
- usuário consegue usar o app offline;
- usuário consegue encontrar produto rapidamente;
- usuário entende recursos desbloqueáveis por anúncio.

## Métricas técnicas

- app abre sem crash;
- banco persiste dados corretamente;
- tema claro/escuro funciona em todas as telas;
- idioma troca sem reiniciar, se possível;
- anúncios não quebram app se falharem;
- recompensas expiram corretamente;
- typecheck passa;
- build Android passa;
- build iOS passa.

## Métricas de monetização

- rewarded ad remove anúncios temporariamente;
- rewarded interstitial libera recurso corretamente;
- usuário não fica preso por falta de internet;
- anúncios aparecem apenas em locais seguros;
- nenhuma função essencial depende de anúncio.

---

# 21. Critérios de conclusão da V1

A V1 estará pronta quando:

```txt
[ ] onboarding funciona
[ ] dashboard funciona
[ ] cadastro de produto funciona
[ ] edição de produto funciona
[ ] entrada de estoque funciona
[ ] saída de estoque funciona
[ ] alertas básicos funcionam
[ ] histórico funciona
[ ] relatórios básicos funcionam
[ ] configurações funcionam
[ ] tema claro funciona
[ ] tema escuro funciona
[ ] idioma PT-BR funciona
[ ] idioma EN funciona
[ ] idioma ES funciona
[ ] banco local persiste dados
[ ] camada de anúncios está centralizada
[ ] rewarded ad remove anúncios temporariamente
[ ] rewarded interstitial libera recurso temporário
[ ] app não quebra sem internet
[ ] dados críticos não aparecem em logs
[ ] backup básico funciona
[ ] typecheck passa
[ ] build Android passa
[ ] build iOS passa
[ ] política de privacidade preparada
```

---

# 22. Ordem recomendada após este blueprint

## Próximos documentos

```txt
docs/02_DESIGN_SYSTEM.md
docs/03_USER_FLOW.md
docs/05_DATA_MODEL.md
docs/04_SCREEN_SPECS.md
docs/06_CODEX_TASKS.md
docs/07_RELEASE_CHECKLIST.md
```

## Próxima fase imediata

A próxima etapa deve ser o **Design System**, definindo:

- personalidade visual;
- paleta clara;
- paleta escura;
- tipografia;
- espaçamentos;
- cards;
- botões;
- badges;
- alertas;
- bottom tabs;
- componentes globais;
- regras visuais para anúncios e premium.

---

# 23. Resumo executivo

O app será um controle de estoque offline, seguro e multilíngue, voltado para pequenos negócios e autônomos. A V1 deve priorizar cadastro de produtos, entradas, saídas, alertas, histórico, relatórios básicos, tema claro/escuro e anúncios premiados. A monetização será baseada em recompensa: o usuário pode assistir anúncios para remover anúncios temporariamente ou liberar recursos avançados por tempo/uso limitado. O núcleo do app deve continuar funcionando sem internet e sem anúncios.
