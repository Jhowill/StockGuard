# Resposta para App Store Review - Portugues (Brasil)

> Antes de enviar: confirme os itens entre colchetes. Nao envie nenhuma afirmacao que ainda nao tenha sido realizada no App Store Connect, no AdMob ou no site publico.

## Texto para colar no Resolution Center

Ola, equipe da App Review,

Obrigado pela analise detalhada do EstoqueGuard Offline. Revisamos integralmente o aplicativo, o binario, os metadados, os fluxos de anuncios, as praticas de privacidade e as submissões relacionadas ao produto. Esta nova submissao foi preparada para responder aos pontos levantados nas Guidelines 2.1(a), 4.3, 5.1 e aos requisitos de informacoes de revisao.

### 1. Ausencia de conta, login ou credenciais de demonstracao

O EstoqueGuard Offline nao possui cadastro de conta, login, autenticacao em servidor, perfil online ou armazenamento em nuvem proprio. Nenhuma credencial de demonstracao e necessaria.

O nome de perfil, quando informado pelo usuario, e apenas um dado local usado para personalizar a saudacao inicial. PIN e biometria tambem sao opcionais e protegem somente o acesso aos dados armazenados no proprio dispositivo. Eles nao representam uma conta, nao validam identidade em servidor e podem ser ignorados durante o onboarding para que todas as funcoes sejam avaliadas sem bloqueio.

### 2. Correcao do fluxo de anuncios recompensados - Guideline 2.1(a)

Reformulamos o fluxo de anuncios recompensados para evitar uma interface sem resposta, especialmente em iPad.

As alteracoes incluem:

- Anuncios recompensados e rewarded interstitial sao pre-carregados antes da interacao do usuario.
- O botao informa imediatamente que o anuncio esta sendo preparado e bloqueia toques concorrentes enquanto uma solicitacao estiver em andamento.
- Falhas de rede, ausencia de inventario, expiracao de tempo, modulo nativo indisponivel e erros do provedor recebem tratamento explicito.
- Quando o primeiro formato nao possui inventario, o aplicativo tenta o outro formato recompensado configurado.
- Quando o AdMob permanece indisponivel apos as tentativas, o aplicativo informa o ocorrido e concede a pausa de anuncios ou o recurso secundario como cortesia. Assim, nenhuma tela fica travada ou sem retorno.
- Fechar um anuncio antes do evento de recompensa nao concede a recompensa quando o anuncio foi exibido com sucesso.
- Cadastro de produtos, edicao, entradas, saidas, perdas, devolucoes, ajustes e saldo inicial nunca dependem de anuncios e continuam funcionais offline.

### 3. Como reproduzir e testar os anuncios

1. Conclua o onboarding sem ativar PIN ou biometria.
2. Na Home, localize o cartao `Pausa nas propagandas` e toque em `Assistir e pausar propagandas`.
3. O app exibe `Preparando anuncio...` enquanto carrega o formato recompensado. Se um anuncio estiver disponivel, conclua a visualizacao e feche-o. A Home exibira a pausa de cinco minutos.
4. Se nao houver inventario de anuncios, o app mostrara uma mensagem clara e aplicara a pausa como cortesia, mantendo a interface responsiva.
5. Para testar recursos opcionais, abra `Recursos do app` > `Abrir recompensas e recursos extras`.
6. Selecione PDF avancado, CSV avancado ou backup criptografado e toque em `Assistir e desbloquear`.
7. O mesmo tratamento de indisponibilidade e feedback e aplicado aos recursos extras. O aplicativo nunca bloqueia funcoes essenciais por causa de anuncio.

Os anuncios podem exigir conexao com a internet, mas o controle basico de estoque e os dados locais permanecem funcionais sem conexao.

### 4. Diferenciacao e revisao de spam - Guideline 4.3

[Use somente apos confirmar no App Store Connect: Revisamos todas as submissões associadas a nossa conta e confirmamos que o EstoqueGuard Offline e a unica versao submetida deste produto sob o Bundle ID `com.jhowill.stockguard`. Qualquer submissao duplicada ou variante equivalente foi retirada antes deste reenvio.]

O EstoqueGuard Offline e um aplicativo independente, nativo e offline-first de controle de estoque. Ele nao e um site empacotado e nao depende de conta ou servidor proprio para a experiencia principal. Seus diferenciais funcionais incluem:

- Banco SQLite no dispositivo para produtos, categorias, fornecedores, configuracoes e historico.
- Registro estruturado de entradas, saidas, perdas, devolucoes e ajustes, com atualizacao imediata do saldo.
- Alertas locais de estoque minimo, estoque zerado e validade proxima.
- Relatorios locais de movimentacao, produtos movimentados, PDF e CSV.
- Backup comum e backup criptografado por senha, com validacao do arquivo, copia de seguranca antes da restauracao e tratamento de arquivos invalidos.
- Protecao opcional por PIN e biometria, usando recursos locais do sistema operacional.
- Dados principais mantidos no dispositivo, sem login e sem servidor proprio.
- Interface localizada em portugues, ingles e espanhol, com configuracao de moeda e tema.

Tambem revisamos nome, descricao, subtitulo, palavras-chave, screenshots e notas de revisao para que representem com clareza a experiencia de inventario local, privacidade e funcionamento offline. Todos os icones, imagens, capturas e demais materiais usados na ficha pertencem ao desenvolvedor ou possuem a licenca de uso adequada.

### 5. Privacidade, permissoes e anuncios - Guideline 5.1

O aplicativo disponibiliza politica de privacidade e canal de suporte dentro de `Configuracoes > Sobre`. Os termos de uso tambem estao disponiveis nessa area do app.

Politica de privacidade: https://sites.google.com/view/jwm-devcreator/privacidade/estoqueguard

Suporte: https://sites.google.com/view/jwm-devcreator/p%C3%A1gina-inicial

Dados de estoque, fotos de produtos, nome de perfil, fornecedores, valores, PIN, biometria e backups permanecem no dispositivo. O aplicativo nao envia esses dados a um servidor proprio.

O Google Mobile Ads SDK pode processar endereco IP para estimar localizacao aproximada, identificadores de dispositivo e publicidade, interacoes, dados de publicidade, diagnosticos e desempenho para publicidade, analise e prevencao de fraude. Essas praticas foram declaradas na secao App Privacy do App Store Connect. O consentimento de publicidade e gerenciado pelo Google User Messaging Platform, e o iOS apresenta a solicitacao de App Tracking Transparency quando aplicavel. O usuario pode revisar as preferencias de privacidade de anuncios em `Configuracoes > Gerenciar privacidade dos anuncios`.

O acesso a fotos ocorre somente quando o usuario escolhe adicionar uma foto a um produto. Face ID e usado apenas para desbloquear o acesso local quando o usuario ativa voluntariamente a biometria. O app nao solicita contatos, localizacao precisa, microfone, camera, SMS, chamadas ou acesso amplo a arquivos.

### 6. Criptografia e export compliance

O aplicativo oferece backup criptografado opcional por senha usando AES padrao por meio da biblioteca `crypto-js`. Por esse motivo, a configuracao iOS declara que o aplicativo usa criptografia nao isenta no Info.plist, e a submissao segue o questionario de Export Compliance do App Store Connect. O aplicativo nao usa algoritmo proprietario de criptografia, VPN ou criptografia propria para trafego de rede.

### 7. Informacoes finais para revisao

- Build revisado em instalacao limpa: [informe o numero do build enviado].
- Dispositivos testados: [informe iPhone, iPad e versoes do iOS/iPadOS testadas].
- Nao ha compra no app, assinatura, conteudo pago, login, conteudo gerado por usuarios ou integracao com servicos financeiros.
- O aplicativo contem anuncios identificados como publicidade, possui canal para relato de anuncio inadequado e limita o conteudo de anuncios a classificacao adequada.
- O aplicativo suporta iPhone e iPad em orientacao vertical.

Permanecemos disponiveis caso precisem de qualquer informacao adicional ou de um roteiro complementar de teste.

Atenciosamente,

Jhowill
Desenvolvedor do EstoqueGuard Offline
jwmdevcreator@outlook.com

## Checklist antes de colar

- Confirmar que nao ha outra submissao equivalente ativa ou pendente.
- Substituir os dois campos entre colchetes por informacoes reais.
- Confirmar que politica e suporte abrem publicamente, sem autenticação.
- Confirmar que a App Privacy foi preenchida conforme `12_STORE_CONSOLE_DATA.md`.
- Confirmar que o questionario de Export Compliance foi respondido para o build final.
- Confirmar teste real do fluxo recompensado em iPad, incluindo falta de inventario e fechamento antecipado do anuncio.
