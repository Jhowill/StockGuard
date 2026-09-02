# 10 - Publicacao AdMob

## Configuracao do app

- Android app ID: `ca-app-pub-4042606302261972~8243870370`
- iOS app ID: `ca-app-pub-4042606302261972~4321735996`
- Os IDs de rewarded, rewarded interstitial, banner e native estao separados por plataforma em `app.json`.
- O modo de teste permanece desativado em builds de producao.
- UMP e ATT sao executados antes da inicializacao do SDK.

## app-ads.txt

O arquivo `app-ads.txt` deste repositorio deve ser publicado exatamente na raiz do dominio informado como site do desenvolvedor nas duas lojas, por exemplo:

`https://example.com/app-ads.txt`

O Google Sites fornecido funciona para contato e politica, mas nao oferece controle sobre `https://sites.google.com/app-ads.txt`. Por isso, ele nao consegue atender sozinho a verificacao de propriedade do AdMob.

Use um dominio proprio ou Firebase Hosting, publique o arquivo da raiz deste repositorio e informe esse dominio como Developer Website/Marketing URL nas lojas. Depois, no AdMob:

1. Vincule `com.jhowill.stockguard` a ficha do Google Play.
2. Vincule `com.jhowill.stockguard` a ficha da App Store.
3. Abra `Apps > app-ads.txt` e solicite nova verificacao.
4. Confirme o estado `Verified`.
5. Confirme o estado de App Readiness como aprovado para Android e iOS.

Sem essas etapas externas o app continuara tratando falta de inventario sem travar, mas o AdMob pode limitar ou deixar de servir anuncios de producao.
