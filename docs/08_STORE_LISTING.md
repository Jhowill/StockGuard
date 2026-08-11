# 08 - Conteudo para Google Play e App Store

Ultima revisao: 6 de agosto de 2026.

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
| Modelo de monetizacao | Banners, anuncios nativos, intersticiais de transicao e anuncios recompensados opcionais; sem compras no app |
| Politica de privacidade | https://raw.githubusercontent.com/Jhowill/StockGuard/main/docs/PRIVACY_POLICY.md |
| Termos de uso | https://raw.githubusercontent.com/Jhowill/StockGuard/main/docs/TERMS_OF_USE.md |
| Suporte | https://github.com/Jhowill/StockGuard/issues |

## Google Play

### Descricao curta

Controle seu estoque offline com produtos, alertas, relatorios e backups seguros.

### Descricao completa

EstoqueGuard Offline e um controle de estoque simples, rapido e feito para funcionar mesmo sem internet.

Cadastre produtos, categorias e fornecedores. Registre entradas e saidas, acompanhe estoque minimo e validade, e veja relatorios para entender a movimentacao do seu negocio.

Seus dados principais ficam no seu aparelho. Para maior seguranca, voce pode usar PIN ou biometria e criar backups para compartilhar ou restaurar quando precisar.

Recursos incluidos:

- Cadastro de produtos, categorias e fornecedores.
- Controle de entradas, saidas, estoque minimo e validade.
- Relatorios de movimentacao e produtos mais movimentados.
- Exportacao de relatorios em PDF e CSV.
- Backup simples e backup criptografado.
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

Controle seu estoque com privacidade e sem depender de internet.

EstoqueGuard Offline ajuda voce a cadastrar produtos, registrar entradas e saidas, acompanhar estoque minimo e validade e consultar relatorios de movimentacao.

Seus dados principais ficam no aparelho. Use PIN ou biometria para proteger o acesso e crie backups quando precisar restaurar ou compartilhar suas informacoes.

Recursos secundarios, como exportacao de relatorios e backup criptografado, podem ser liberados voluntariamente por anuncios recompensados. O cadastro e a movimentacao de estoque nao dependem de anuncios.

### App Privacy

Responda que o app coleta dados por parceiros de publicidade. Para o Google Mobile Ads SDK, declare identificadores, dados de uso, diagnosticos, dados de publicidade e localizacao aproximada derivada de IP conforme as telas do App Store Connect. Marque as finalidades que o SDK efetivamente usa: publicidade de terceiros, analise e funcionalidade/diagnostico quando aplicavel. Declare rastreamento somente conforme a classificacao indicada pelo App Store Connect para a configuracao final do SDK e do AdMob.

URL da politica de privacidade: https://raw.githubusercontent.com/Jhowill/StockGuard/main/docs/PRIVACY_POLICY.md

### Informacoes para revisao

- O app nao exige conta nem credenciais de teste.
- As funcoes basicas funcionam offline.
- A biometria e opcional e protege apenas o acesso local.
- A selecao de foto e opcional e usada apenas para associar imagem a um produto.
- Banners, anuncios nativos e intersticiais podem aparecer em telas de leitura e transicoes; anuncios recompensados so aparecem por escolha do usuario.
- Configuracoes inclui opcoes de privacidade e um canal para denunciar anuncios inadequados.
- `ITSAppUsesNonExemptEncryption` esta configurado como `false`.

## Materiais visuais

- Icone Google Play: `icons/android/playstore/playstore_icon_512.png`.
- Grafico de recursos Google Play: `icons/android/playstore/feature_graphic_1024x500.png`.
- Icone App Store: `icons/ios/store/appstore_icon_1024.png`.
- Capturas de referencia: `assets/screenshots-reference/`.

Antes de enviar, gere capturas reais em aparelhos ou simuladores nas dimensoes exigidas por cada loja. As imagens de referencia do repositorio sao material de apoio e nao substituem as capturas finais da ficha.
