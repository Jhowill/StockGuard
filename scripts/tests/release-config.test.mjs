import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

test('Expo 54 native dependency set stays aligned', () => {
  const pkg = readJson('package.json');
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  assert.match(deps.expo, /\^54\.|~54\./);
  assert.equal(deps.react, '19.1.0');
  assert.equal(deps['react-native'], '0.81.5');
  assert.match(deps['babel-preset-expo'], /54\./);
  assert.equal(deps['react-native-worklets'], '0.5.1');
});

test('store identifiers, versions and native release flags are present', () => {
  const app = readJson('app.json').expo;
  const eas = readJson('eas.json');

  assert.equal(app.version, '1.0.0');
  assert.equal(app.android.package, 'com.jhowill.stockguard');
  assert.equal(app.android.versionCode, 1);
  assert.equal(app.ios.bundleIdentifier, 'com.jhowill.stockguard');
  assert.equal(app.ios.buildNumber, '1');
  assert.equal(app.ios.infoPlist.ITSAppUsesNonExemptEncryption, false);
  assert.ok(eas.build.production);
  assert.ok(eas.build.preview.android.buildType);
});

test('production ads are configured without enabling test mode', () => {
  const app = readJson('app.json').expo;
  const adsPlugin = app.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'react-native-google-mobile-ads');

  assert.equal(app.extra.EXPO_PUBLIC_ADS_ENABLED, 'true');
  assert.equal(app.extra.EXPO_PUBLIC_ADS_TEST_MODE, 'false');
  assert.match(adsPlugin[1].androidAppId, /^ca-app-pub-/);
  assert.match(adsPlugin[1].iosAppId, /^ca-app-pub-/);
  assert.match(app.extra.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID, /^ca-app-pub-/);
  assert.match(app.extra.EXPO_PUBLIC_ADMOB_IOS_REWARDED_INTERSTITIAL_ID, /^ca-app-pub-/);
});
