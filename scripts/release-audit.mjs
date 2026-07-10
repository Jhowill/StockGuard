import fs from 'node:fs';

const app = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const failures = [];

function requireValue(value, message) {
  if (value == null || value === '') failures.push(message);
}

requireValue(app.android?.package, 'android.package is required');
requireValue(app.android?.versionCode, 'android.versionCode is required');
requireValue(app.ios?.bundleIdentifier, 'ios.bundleIdentifier is required');
requireValue(app.ios?.buildNumber, 'ios.buildNumber is required');
requireValue(app.ios?.infoPlist?.NSFaceIDUsageDescription, 'NSFaceIDUsageDescription is required');

const adsPlugin = app.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'react-native-google-mobile-ads');
requireValue(adsPlugin?.[1]?.androidAppId, 'Android AdMob app ID is required');
requireValue(adsPlugin?.[1]?.iosAppId, 'iOS AdMob app ID is required');

for (const key of [
  'EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID',
  'EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID',
  'EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_INTERSTITIAL_ID',
  'EXPO_PUBLIC_ADMOB_IOS_REWARDED_INTERSTITIAL_ID',
]) {
  requireValue(app.extra?.[key], `${key} is required`);
}

for (const file of ['eas.json', 'docs/PRIVACY_POLICY.md', 'docs/TERMS_OF_USE.md']) {
  if (!fs.existsSync(file)) failures.push(`${file} is required`);
}

for (const dependency of ['expo-font', 'expo-constants', 'expo-linking', 'react-native-google-mobile-ads']) {
  if (!pkg.dependencies?.[dependency]) failures.push(`${dependency} must be a direct dependency`);
}

if (app.extra?.EXPO_PUBLIC_ADS_TEST_MODE === 'true') {
  failures.push('Production config must not enable AdMob test mode');
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Release configuration audit passed.');
