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
