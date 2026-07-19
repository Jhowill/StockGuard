# EstoqueGuard Offline

App mobile offline para controle de estoque, construido com Expo SDK 54, React Native, TypeScript, Expo Router e SQLite local.

## Scripts

```bash
npm run start
npm run typecheck
npm run audit:i18n
npm run audit:release
```

## Estado atual

Esta versao ja inclui:

- navegacao base com Expo Router;
- onboarding com preferencias iniciais;
- tabs principais;
- produtos, movimentacoes, alertas, relatorios, configuracoes, categorias, fornecedores, rewards e backup;
- SQLite local com migrations, repositorios e hooks de dominio;
- tema dinamico com base em sistema, claro e escuro;
- i18n local em `pt-BR`, `en` e `es`;
- componentes visuais reutilizaveis;
- AdMob centralizado com consentimento, fallback seguro e rewarded ads para recursos secundarios;
- protecao local com PIN, biometria e mascara de privacidade;
- pacote de icones aplicado pela pasta `icons/` na config do Expo.

## Publicacao

Antes de publicar, rode:

```bash
npm run audit:release
npx expo-doctor
```

O checklist completo fica em `docs/07_RELEASE_CHECKLIST.md`.
