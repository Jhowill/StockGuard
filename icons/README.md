# EstoqueGuard — Pacote de Ícones

Pacote criado para publicação e implementação do app **EstoqueGuard Offline** em iOS e Android.

## iOS / App Store
- `ios/AppIcon.appiconset/` — conjunto completo para Xcode.
- `ios/store/appstore_icon_1024.png` — ícone principal para App Store Connect.
- `ios/optional_ios18_variants/` — variações dark/monochrome opcionais.

## Android / Google Play
- `android/playstore/playstore_icon_512.png` — ícone da loja Google Play.
- `android/playstore/feature_graphic_1024x500.png` — gráfico de recurso da Play Store.
- `android/res/mipmap-*` — ícones launcher por densidade.
- `android/res/mipmap-anydpi-v26/` — XML para adaptive icon.
- `android/expo/` — arquivos prontos para Expo: `icon.png`, `adaptive-icon-foreground.png`, `adaptive-icon-background.png`, `splash-icon.png`.

## Master
- `master/EstoqueGuard_master_2048.png` — arte principal em alta resolução.
- `master/EstoqueGuard_master.svg` — versão vetorial editável simplificada.

## Observações técnicas
- Ícones de loja iOS e Google Play foram exportados sem transparência.
- Adaptive foreground Android possui transparência para funcionar como camada de foreground.
- O sistema operacional aplica máscaras/arredondamento; não aplique bordas arredondadas manualmente nos arquivos de loja.
- Confira o arquivo `manifest.json` para dimensões e modos de cor.

## Configuração sugerida no Expo

```json
{
  "expo": {
    "icon": "./assets/icons/android/expo/icon.png",
    "splash": {
      "image": "./assets/icons/android/expo/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#090D11"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icons/android/expo/adaptive-icon-foreground.png",
        "backgroundImage": "./assets/icons/android/expo/adaptive-icon-background.png"
      }
    },
    "ios": {
      "icon": "./assets/icons/ios/store/appstore_icon_1024.png"
    }
  }
}
```
