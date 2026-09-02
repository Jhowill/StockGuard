# 08 - Conteudo para Google Play e App Store

Ultima revisao: 1 de setembro de 2026.

Este documento reune o texto e as respostas de cadastro para EstoqueGuard Offline 1.0.0. Revise os dados de conta antes do envio, especialmente e-mail de suporte, nome do desenvolvedor e classificacao indicativa.

## Identidade

| Campo | Valor |
| --- | --- |
| Nome do app | EstoqueGuard Offline |
| Desenvolvedor | Jhowill |
| Categoria principal | Negocios |
| Categoria secundaria (App Store) | Produtividade |
| Plataforma | Android e iOS |
| Idioma inicial | Portugues (Brasil) |
| Modelo de monetizacao | Banners, anuncios nativos e anuncios recompensados opcionais; sem compras no app |
| Site/contato | https://sites.google.com/view/jwm-devcreator/p%C3%A1gina-inicial |
| Politica de privacidade | https://sites.google.com/view/jwm-devcreator/privacidade/estoqueguard |
| Suporte | https://sites.google.com/view/jwm-devcreator/p%C3%A1gina-inicial |
| E-mail de suporte | jwmdevcreator@outlook.com |

## Google Play

### Descricao curta

Controle de estoque offline, com dados locais, alertas e backup criptografado.

### Descricao completa

EstoqueGuard Offline e um controle de estoque local, feito para pequenos negocios que precisam registrar produtos e movimentacoes mesmo sem conexao.

Cadastre produtos, categorias e fornecedores. Registre entradas, saidas, perdas, devolucoes e ajustes. Acompanhe estoque minimo e validade, consulte o historico local e gere relatorios a partir dos dados guardados no aparelho.

Seus dados principais ficam no seu aparelho, em banco SQLite local e sem conta obrigatoria. Para maior seguranca, voce pode usar PIN ou biometria e criar backups comuns ou criptografados por senha para compartilhar ou restaurar quando precisar.

Recursos incluidos:

- Cadastro de produtos, categorias e fornecedores.
- Controle de entradas, saidas, perdas, devolucoes, ajustes, estoque minimo e validade.
- Relatorios de movimentacao e produtos mais movimentados.
- Exportacao de relatorios em PDF e CSV.
- Backup simples, backup criptografado por senha e restauracao validada.
- Protecao por PIN e biometria compativel.
- Tema claro ou escuro, idiomas e moedas configuraveis.

O cadastro e a movimentacao de estoque funcionam sem anuncios. Alguns recursos secundarios podem ser liberados voluntariamente por anuncios recompensados. O usuario tambem pode assistir voluntariamente a um anuncio para pausar anuncios comuns por cinco minutos, ate tres vezes por dia.

### Dados de ficha

- Contem anuncios: Sim.
- Publico-alvo: nao direcionado a criancas.
- Acesso especial: nao usa permissao de contatos, localizacao, microfone ou acesso amplo a arquivos.
- Login ou conta: nao ha criacao de conta.
- Exclusao de dados: Configuracoes > Excluir todos os dados, ou desinstalacao do app.

### Data Safety

Declare que o app coleta e compartilha dados por meio do Google Mobile Ads SDK. Os dados de estoque, fotos de produtos, PIN e backups permanecem locais e nao sao coletados pelo desenvolvedor.

| Tipo de dado | Finalidade | Coletado | Compartilhado |
| --- | --- | --- | --- |
| Localizacao aproximada (derivada do IP) | Publicidade, analise e prevencao de fraude | Sim, pelo AdMob | Sim, pelo AdMob |
| Interacoes no app e de anuncios | Publicidade, analise e prevencao de fraude | Sim, pelo AdMob | Sim, pelo AdMob |
| Diagnosticos e desempenho | Analise, publicidade e prevencao de fraude | Sim, pelo AdMob | Sim, pelo AdMob |
| IDs de dispositivo e publicidade | Publicidade, analise e prevencao de fraude | Sim, pelo AdMob | Sim, pelo AdMob |

Marque transmissao criptografada em transito para os dados do AdMob. Esta declaracao foi baseada na documentacao do Google Mobile Ads SDK e deve ser revisada se for adicionada mediacao, Firebase, analytics ou qualquer outro SDK.

## App Store

### Nome e subtitulo

| Campo | Texto |
| --- | --- |
| Nome | EstoqueGuard Offline |
| Subtitulo | Estoque simples, offline |
| Texto promocional | Controle produtos e movimentacoes mesmo sem internet. |
| Palavras-chave | estoque,inventario,produtos,controle,offline,negocio,relatorio |
| Categoria principal | Business |
| Categoria secundaria | Productivity |

### Descricao

Controle seu estoque localmente, com privacidade e sem depender de internet.

EstoqueGuard Offline ajuda voce a cadastrar produtos, registrar entradas, saidas, perdas, devolucoes e ajustes, acompanhar estoque minimo e validade e consultar relatorios de movimentacao.

Os dados ficam no aparelho em banco SQLite local, sem login ou servidor proprio. Use PIN ou biometria para proteger o acesso e crie backups comuns ou criptografados por senha quando precisar restaurar ou compartilhar suas informacoes.

Recursos secundarios, como exportacao de relatorios e backup criptografado, podem ser liberados voluntariamente por anuncios recompensados. O cadastro e a movimentacao de estoque nao dependem de anuncios.

### App Privacy

Responda que o app coleta dados por parceiros de publicidade. Para o Google Mobile Ads SDK, declare identificadores, dados de uso, diagnosticos, dados de publicidade e localizacao aproximada derivada de IP conforme as telas do App Store Connect. Marque as finalidades que o SDK efetivamente usa: publicidade de terceiros, analise e funcionalidade/diagnostico quando aplicavel. Declare rastreamento somente conforme a classificacao indicada pelo App Store Connect para a configuracao final do SDK e do AdMob.

URL da politica de privacidade: https://sites.google.com/view/jwm-devcreator/privacidade/estoqueguard

### Informacoes para revisao

- O app nao exige conta nem credenciais de teste.
- As funcoes basicas funcionam offline.
- A biometria e opcional e protege apenas o acesso local.
- A selecao de foto e opcional e usada apenas para associar imagem a um produto.
- Banners e anuncios nativos podem aparecer em telas de leitura; anuncios recompensados so aparecem por escolha do usuario.
- Anuncios recompensados sao pre-carregados. Se o AdMob nao fornecer inventario, o app informa o ocorrido e libera a pausa ou o recurso como cortesia, evitando uma tela sem resposta.
- Configuracoes inclui opcoes de privacidade e um canal para denunciar anuncios inadequados.
- Os termos de uso tambem estao disponiveis em Configuracoes > Sobre > Termos de uso.
- `ITSAppUsesNonExemptEncryption` esta configurado como `false`.

## Materiais visuais

- Icone Google Play: `icons/android/playstore/playstore_icon_512.png`.
- Grafico de recursos Google Play: `icons/android/playstore/feature_graphic_1024x500.png`.
- Icone App Store: `icons/ios/store/appstore_icon_1024.png`.
- Capturas de referencia: `assets/screenshots-reference/`.

Antes de enviar, gere capturas reais em aparelhos ou simuladores nas dimensoes exigidas por cada loja. As imagens de referencia do repositorio sao material de apoio e nao substituem as capturas finais da ficha.
