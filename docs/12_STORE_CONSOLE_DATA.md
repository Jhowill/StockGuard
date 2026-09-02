# 12 - Dados para App Store Connect e Play Console

Ultima revisao: 2 de setembro de 2026.

Este guia descreve o comportamento do build atual. Revise cada campo no console antes de publicar, principalmente se forem adicionados SDKs, mediacao de anuncios, analytics, login ou sincronizacao em nuvem.

## Identidade comum

| Campo | Valor |
| --- | --- |
| Nome | EstoqueGuard Offline |
| Android package | `com.jhowill.stockguard` |
| iOS bundle ID | `com.jhowill.stockguard` |
| Desenvolvedor | Jhowill |
| Categoria | Negocios / Business |
| Categoria secundaria iOS | Produtividade / Productivity |
| Suporte | https://sites.google.com/view/jwm-devcreator/p%C3%A1gina-inicial |
| E-mail | jwmdevcreator@outlook.com |
| Politica de privacidade | https://sites.google.com/view/jwm-devcreator/privacidade/estoqueguard |
| Contem anuncios | Sim |
| Login ou conta | Nao |
| Compras no app ou assinatura | Nao |

## Google Play Console

### App access

Escolha `All functionality is available without special access`.

Texto para instrucoes de revisao:

> O app nao possui conta, login, assinatura ou servidor proprio. Todas as funcoes principais podem ser testadas apos concluir o onboarding local. PIN e biometria sao opcionais e protegem somente dados no dispositivo. Anuncios recompensados sao opcionais e, quando nao ha inventario, o app informa o ocorrido sem travar o fluxo.

### Target audience and content

- O app nao e destinado a criancas.
- Selecione somente as faixas etarias que correspondem ao publico de negocios adulto pretendido. Nao inclua menores de 13 anos ou a opcao "includes children".
- Contem anuncios: `Yes`.
- Nao e app de noticias, namoro, saude, apostas, conteudo gerado por usuarios ou compartilhamento social.

### Data Safety

Responda `Yes, this app collects or shares user data`, porque o Google Mobile Ads SDK coleta e compartilha dados automaticamente. Marque transmissao criptografada em transito: `Yes`. O app nao oferece conta, portanto nao ha opcao de exclusao de conta.

| Tipo no formulario | Coleta | Compartilha | Obrigatorio | Finalidades |
| --- | --- | --- | --- | --- |
| Localizacao aproximada, derivada de IP | Sim | Sim, com Google/AdMob | Sim, pelo SDK | Publicidade ou marketing; analytics; prevencao de fraude, seguranca e conformidade |
| Atividade no app: interacoes no app | Sim | Sim, com Google/AdMob | Sim, pelo SDK | Publicidade ou marketing; analytics; prevencao de fraude, seguranca e conformidade |
| Diagnosticos: falhas e desempenho | Sim | Sim, com Google/AdMob | Sim, pelo SDK | Analytics; prevencao de fraude, seguranca e conformidade |
| Identificadores do dispositivo ou outros identificadores, incluindo Advertising ID/App Set ID quando disponiveis | Sim | Sim, com Google/AdMob | Sim, pelo SDK | Publicidade ou marketing; analytics; prevencao de fraude, seguranca e conformidade |

Nao declare como coletados pelo app: nome de perfil, produtos, descricao, fornecedores, fotos, valores, PIN, biometria, backups, PDF ou CSV. Eles ficam locais. Tambem nao declare e-mail de suporte ou dados de formulario de site, pois o app apenas abre o navegador e nao recebe esses dados.

### Content rating

Preencha o questionario IARC de forma literal:

- Violencia, sexo/nudez, linguagem ofensiva, drogas, jogos de azar, medo, conteudo sexual, conteudo gerado por usuarios e compartilhamento de localizacao: `No`.
- Anuncios: `Yes` quando o questionario perguntar.
- O filtro AdMob esta configurado para classificacao `PG`; mantenha esse filtro no codigo e nos controles do AdMob.

### Declaracoes adicionais

- Permissoes sensiveis: nao usa localizacao, contatos, microfone, camera, SMS, chamadas ou armazenamento amplo.
- Fotos: acesso apenas apos acao explicita de escolher foto de produto.
- Dados financeiros: o app armazena valores de produtos somente no dispositivo e nao processa pagamentos, credito, banco ou investimentos.
- Politica de privacidade: informe a URL publica acima no campo obrigatorio e confirme que abre sem login.

## App Store Connect

### App information

| Campo | Valor |
| --- | --- |
| Nome | EstoqueGuard Offline |
| Subtitulo | Estoque local, simples e offline |
| Categoria primaria | Business |
| Categoria secundaria | Productivity |
| URL de suporte | https://sites.google.com/view/jwm-devcreator/p%C3%A1gina-inicial |
| URL da politica | https://sites.google.com/view/jwm-devcreator/privacidade/estoqueguard |
| Direitos de conteudo | Nao contem, exibe ou acessa conteudo de terceiros |

### App Privacy

Escolha `Yes, we collect data from this app`, pois o Google Mobile Ads SDK e um parceiro terceiro. Declare tambem a utilizacao para rastreamento quando o App Store Connect perguntar sobre o SDK de publicidade: o SDK pode combinar identificadores e interacoes para publicidade de terceiros quando o usuario autoriza ATT/consentimento.

| Dado | Coletado pelo parceiro | Vinculado ao usuario/dispositivo | Usado para tracking | Finalidades a selecionar |
| --- | --- | --- | --- | --- |
| Localizacao aproximada, derivada de IP | Sim | Sim | Sim, quando permitido | Third-Party Advertising; Analytics; App Functionality/Fraud Prevention quando a tela oferecer |
| Identificadores: Device ID | Sim | Sim | Sim, quando permitido | Third-Party Advertising; Analytics |
| Dados de uso: Product Interaction | Sim | Sim | Sim, quando permitido | Third-Party Advertising; Analytics |
| Dados de publicidade: Advertising Data | Sim | Sim | Sim, quando permitido | Third-Party Advertising; Analytics |
| Diagnosticos: Crash Data e Performance Data | Sim | Pode ser associado ao dispositivo | Nao marque tracking apenas para diagnostico | Analytics; App Functionality |

Nao declare os dados locais de inventario, fotos, backups, PIN ou biometria como coletados: eles nao sao transmitidos pelo app. Revise esta tabela contra a versao atual da documentacao do Google Mobile Ads SDK antes de cada nova submissao.

### Age rating

Responda `No` para violencia, sexo/nudez, linguagem ofensiva, temas adultos, drogas, jogos de azar, conteudo gerado por usuario e acesso livre a web. O app abre links de suporte e privacidade, mas nao fornece navegador nem acesso irrestrito a conteudo web. Responda sobre publicidade conforme a pergunta apresentada e mantenha a classificacao AdMob `PG`.

### Export compliance

- `ITSAppUsesNonExemptEncryption`: `Yes` no build atual.
- O backup criptografado usa AES padrao por meio da biblioteca `crypto-js`; por isso nao declare que o app usa somente criptografia do sistema operacional.
- No questionario do App Store Connect, informe que o app usa algoritmo padrao, nao proprietario, para proteger backups locais. Nao informe algoritmo proprietario nem funcao de VPN.
- A documentacao da Apple indica que algoritmos padrao fora do sistema operacional podem exigir declaracao de criptografia para distribuicao na Franca. Se a Franca estiver entre os territorios de distribuicao, providencie a declaracao francesa solicitada no App Store Connect. Para qualquer classificacao legal ou documento adicional, siga o resultado do questionario da Apple e consulte orientacao juridica especializada.

### App Review Information

Cole as notas de `09_APP_REVIEW_NOTES.md` e acrescente:

> The app has no account, login, or server authentication. No demo account is required. PIN and biometrics are optional and only protect local data. The app works offline for product registration and stock movements. Rewarded ads are optional for secondary features and never block core inventory actions. If no ad is available, the app shows feedback and grants the optional reward as a courtesy without leaving the interface unresponsive.

Para a rejeicao 4.3, use a resposta de `11_APP_REVIEW_4_3.md` somente depois de retirar qualquer submissao duplicada no App Store Connect.

## Verificacoes externas antes de enviar

1. Abrir a politica e o suporte em um iPhone, iPad e Android sem login.
2. Confirmar no AdMob que mensagens UMP foram publicadas para iOS e Android.
3. Confirmar App Readiness e vincular os dois aplicativos de loja no AdMob.
4. Publicar `app-ads.txt` em dominio proprio, conforme `10_ADMOB_PUBLISHING.md`.
5. Enviar capturas reais do build final, sem dados pessoais, logos de terceiros ou telas de referencia.
6. Testar instalacao limpa, atualizacao, uso offline, foto, PIN, biometria, backup, restauracao, PDF, CSV, UMP, ATT e os anuncios em iPhone, iPad e Android.

## Registro tecnico desta revisao

- `npm run audit:release` passou com 42 testes, TypeScript, auditoria de configuracao e auditoria de i18n.
- `npm audit fix` nao disruptivo foi aplicado em 2 de setembro de 2026. Restaram avisos transitivos da cadeia Expo/Metro no SDK 54, incluindo avisos altos em ferramentas de bundling. O npm oferece correcao completa somente por atualizacao forcada para Expo 57, que nao deve ser feita nesta release porque exige migracao e nova validacao nativa.
- Antes de uma proxima grande versao, planeje a atualizacao do Expo SDK e repita a auditoria de dependencias, builds e testes fisicos.
