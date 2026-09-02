# 07 - Release Checklist

Checklist operacional para publicar o EstoqueGuard Offline na Google Play e App Store.

## Antes do build

- Rodar `npm run audit:release`.
- Rodar `npx expo-doctor`.
- Rodar `npm audit --omit=dev --audit-level=high`. Nao usar `--force` para atualizar Expo sem um ciclo planejado de migracao e testes nativos.
- Confirmar Expo SDK 54 e dependencias alinhadas.
- Confirmar `android.package` e `ios.bundleIdentifier`.
- Confirmar icones e splash em `icons/`.
- Confirmar que o app abre sem internet.
- Confirmar que cadastro, edicao e movimentacao de estoque nao exigem anuncio.
- Confirmar que PDF, CSV, backup criptografado e outros extras usam rewarded opt-in.
- Confirmar que consentimento AdMob/UMP e ATT no iOS estao configurados.
- Confirmar em dispositivo real que nenhum banner, nativo ou intersticial e solicitado antes do consentimento UMP.
- Confirmar que Configuracoes > Denunciar anuncio inadequado abre o canal de suporte.
- Confirmar que politica e contato abrem publicamente em `sites.google.com/view/jwm-devcreator`.
- Confirmar que o AdMob pre-carrega rewarded e rewarded interstitial no iPhone, iPad e Android.
- Confirmar que falta de inventario apresenta feedback e aplica a liberacao de cortesia sem travar a interface.
- Revisar `docs/08_STORE_LISTING.md` e preencher os campos de contato que pertencem a conta da loja.

## Builds

Para gerar um QR de instalacao direta, use o build Android interno:

```bash
npm run build:android
```

Esse perfil gera um APK interno no EAS e expõe o QR/link de download no fluxo de build.

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

Tambem e util gerar um APK interno antes da producao:

```bash
npx eas-cli build --platform android --profile preview
```

## Google Play

- Marcar que o app contem anuncios.
- Preencher Data Safety com dados tratados pelo AdMob.
- Informar que o app funciona offline e salva dados no dispositivo.
- Incluir politica de privacidade publica.
- Testar backup/restauracao e exportacao em dispositivo real.
- Testar tema claro/escuro, acessibilidade de contraste e idiomas.
- Verificar que nao ha permissao sensivel desnecessaria.

## App Store

- Preencher App Privacy considerando AdMob, diagnostico e identificadores.
- Informar nas notas de revisao onde denunciar anuncios inadequados.
- Informar nas notas de revisao que nao existe conta; PIN e biometria sao apenas protecao local.
- Reproduzir no iPad o fluxo Home > Assistir e pausar propagandas e Premium > Assistir e desbloquear.
- Confirmar ATT e mensagem de rastreamento.
- Confirmar a declaracao de exportacao de criptografia no App Store Connect. O app usa AES padrao via `crypto-js` para backups criptografados e declara `ITSAppUsesNonExemptEncryption=true`.
- Informar politica de privacidade publica.
- Testar biometria/Face ID em build nativa.
- Testar restore de backup e exportacao em dispositivo real.

## Pos-build

- Validar instalacao limpa.
- Validar atualizacao sobre build anterior.
- Validar abertura sem internet.
- Validar idioma trocado em tempo real.
- Validar falha de anuncio sem crash.
- Validar falha de banco com tela de recuperacao.
- Validar exportacao PDF/CSV e compartilhamento.
- Validar restauracao rejeitando arquivo invalido.

## Pendencias externas

- Confirmar que as mensagens UMP estao publicadas no painel do Google AdMob.
- Vincular os apps iOS e Android as respectivas fichas das lojas no AdMob e concluir o App Readiness.
- Publicar e verificar `app-ads.txt` em dominio proprio ou Firebase Hosting; Google Sites nao permite arquivo no diretorio raiz exigido pelo crawler.
- Configurar credenciais Android/iOS no EAS.
- Preencher formularios de privacidade nas lojas.
