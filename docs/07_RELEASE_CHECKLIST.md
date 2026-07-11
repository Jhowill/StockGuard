# 07 - Release Checklist

Checklist operacional para publicar o EstoqueGuard Offline na Google Play e App Store.

## Antes do build

- Rodar `npm run audit:release`.
- Rodar `npx expo-doctor`.
- Confirmar Expo SDK 54 e dependencias alinhadas.
- Confirmar `android.package` e `ios.bundleIdentifier`.
- Confirmar icones e splash em `icons/`.
- Confirmar que o app abre sem internet.
- Confirmar que cadastro, edicao e movimentacao de estoque nao exigem anuncio.
- Confirmar que PDF, CSV, backup criptografado e outros extras usam rewarded opt-in.
- Confirmar que consentimento AdMob/UMP e ATT no iOS estao configurados.
- Confirmar que `.env.example` nao contem IDs reais sensiveis.

## Builds

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
- Confirmar ATT e mensagem de rastreamento.
- Confirmar `ITSAppUsesNonExemptEncryption=false`.
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

- Criar mensagens UMP no painel do Google AdMob.
- Configurar credenciais Android/iOS no EAS.
- Publicar URL definitiva da politica de privacidade e termos.
- Preencher formularios de privacidade nas lojas.
