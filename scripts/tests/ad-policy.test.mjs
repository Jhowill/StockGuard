import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('core stock flows do not import or call rewarded ads', () => {
  const criticalScreens = ['app/products/new.tsx', 'app/products/movement.tsx'];

  for (const file of criticalScreens) {
    const source = read(file);
    assert.doesNotMatch(source, /adsService|showRewardedAd|showRewardedInterstitial/);
  }
});

test('stock copy does not describe ads as mandatory for saving inventory', () => {
  const source = read('src/i18n/index.ts');
  const forbidden = [
    /an[uú]ncio obrigat[oó]rio/i,
    /required ad/i,
    /ad required/i,
    /must watch the ad/i,
    /required ad must/i,
    /debes ver el anuncio/i,
    /precisa assistir o an[uú]ncio/i,
  ];

  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern);
  }
});

test('rewarded ads remain available only for secondary features', () => {
  const reports = read('app/(tabs)/reports.tsx');
  const backup = read('app/backup.tsx');

  assert.match(reports, /showRewardedInterstitial/);
  assert.match(reports, /advanced_pdf_reports|csv_export/);
  assert.match(backup, /showRewardedInterstitial/);
  assert.match(backup, /encrypted_backup/);
});

test('temporary ad-free reward lasts five minutes and is limited to three daily grants', () => {
  const rewards = read('src/services/rewardedAccessService.ts');
  const entitlements = read('src/database/repositories/adEntitlementRepository.ts');
  const home = read('app/(tabs)/index.tsx');
  const ads = read('src/services/adsService.ts');

  assert.match(rewards, /TEMPORARY_AD_FREE_DURATION_MINUTES = 5/);
  assert.match(entitlements, /TEMPORARY_AD_FREE_DAILY_LIMIT = 3/);
  assert.match(entitlements, /withExclusiveTransaction/);
  assert.match(home, /grantTemporaryAdFree/);
  assert.match(home, /adFreeAvailable/);
  assert.match(ads, /canShowStandardAds/);
  assert.match(ads, /Feature-unlock rewarded ads intentionally bypass this check/);
  assert.match(rewards, /notifyAdAccessChanged/);
  assert.match(read('src/hooks/useAdsAccess.ts'), /subscribeAdAccess/);
});

test('standard ads are limited to non-critical screens and never interrupt navigation', () => {
  const home = read('app/(tabs)/index.tsx');
  const products = read('app/(tabs)/products.tsx');
  const alerts = read('app/(tabs)/alerts.tsx');
  const reports = read('app/(tabs)/reports.tsx');
  const detail = read('app/products/[id].tsx');
  const ads = read('src/services/adsService.ts');

  assert.match(home, /StandardBannerAd placement="banner_home"/);
  assert.match(alerts, /StandardBannerAd placement="banner_alerts"/);
  assert.match(products, /StandardNativeAd placement="native_products"/);
  assert.match(reports, /StandardNativeAd placement="native_reports"/);
  assert.doesNotMatch(detail, /showStandardInterstitialAtTransition|preloadStandardInterstitial/);
  assert.doesNotMatch(ads, /showStandardInterstitialAtTransition|claimInterstitialDisplay/);
  assert.match(ads, /canShowStandardAds/);
});

test('all ad formats wait for consent and apply a safe content rating', () => {
  const ads = read('src/services/adsService.ts');
  const banner = read('src/components/ads/StandardBannerAd.tsx');
  const native = read('src/components/ads/StandardNativeAd.tsx');

  assert.match(ads, /prepareAdsForDisplay/);
  assert.match(ads, /requestInfoUpdate\(\);\s+const finalConsent = await ads\.AdsConsent\.loadAndShowConsentFormIfRequired\(\)/);
  assert.match(ads, /maxAdContentRating: ads\.MaxAdContentRating\.PG/);
  assert.match(ads, /tagForChildDirectedTreatment: false/);
  assert.match(banner, /prepareAdsForDisplay\(\)/);
  assert.match(native, /prepareAdsForDisplay\(\)/);
  assert.match(native, /NativeAssetType\.ICON/);
});

test('rewarded ads preload, prevent concurrent presentation and fail over safely', () => {
  const ads = read('src/services/adsService.ts');
  const access = read('src/hooks/useAdsAccess.ts');

  assert.match(access, /preloadRewardedAds\(\)/);
  assert.match(ads, /rewardedFlowActive/);
  assert.match(ads, /ADS_ALREADY_IN_PROGRESS/);
  assert.match(ads, /fallbackKind: RewardedKind = kind === 'rewarded' \? 'rewardedInterstitial' : 'rewarded'/);
  assert.match(ads, /hasRewardedInterstitialConfig\(platform\)/);
  assert.match(ads, /source: 'availability_fallback'/);
  assert.match(ads, /earned \? \{ status: 'success', rewardType, source: 'ad' \} : \{ status: 'cancelled' \}/);
});

test('the app provides an inappropriate-ad reporting path required for iOS review', () => {
  const settings = read('app/(tabs)/settings.tsx');

  assert.match(settings, /AD_REPORT_URL = SUPPORT_URL/);
  assert.match(settings, /settings\.reportAd/);
  assert.match(settings, /openExternalUrl\(AD_REPORT_URL\)/);
});
