# 09 - App Review Notes

Texto sugerido para a proxima submissao no App Store Connect.

## Acesso

O EstoqueGuard Offline nao possui conta, login ou servidor de autenticacao. Nenhuma conta de demonstracao e necessaria. O PIN e a biometria sao opcionais e protegem apenas os dados armazenados localmente no aparelho.

## Correcao da Guideline 2.1(a)

O fluxo de anuncios recompensados foi reformulado para iPhone e iPad:

- os anuncios sao pre-carregados antes do toque;
- a interface informa imediatamente que o anuncio esta sendo preparado;
- toques concorrentes sao bloqueados;
- erros de rede, falta de inventario e timeout recebem tratamento explicito;
- o rewarded interstitial tenta o rewarded comum quando o primeiro formato nao tem inventario;
- se a rede AdMob permanecer indisponivel, o app libera a pausa ou o recurso como cortesia para nao deixar a interface sem resposta;
- fechar um anuncio antes do evento de recompensa nao concede a recompensa.

## Como testar

1. Na Home, toque em `Assistir e pausar propagandas`.
2. Conclua o anuncio. A Home exibira a pausa de cinco minutos.
3. Abra `Recursos do app` > `Recompensas e recursos extras`.
4. Escolha PDF, CSV ou backup criptografado e toque em `Assistir e desbloquear`.
5. Se o AdMob nao fornecer um anuncio, o app exibira uma mensagem e aplicara a liberacao de cortesia sem bloquear a tela.

Os recursos essenciais de cadastro e movimentacao de estoque funcionam offline e nunca exigem anuncios.

Suporte: jwmdevcreator@outlook.com
