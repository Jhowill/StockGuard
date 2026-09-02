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

const localizationPlugin = app.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-localization');
if (localizationPlugin?.[1]?.supportedLocales?.android?.includes('pt-BR')) {
  failures.push('Android native resource filters must use pt instead of the unsupported AAPT value pt-BR');
}

for (const key of [
  'EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID',
  'EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID',
  'EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_INTERSTITIAL_ID',
  'EXPO_PUBLIC_ADMOB_IOS_REWARDED_INTERSTITIAL_ID',
  'EXPO_PUBLIC_ADMOB_ANDROID_BANNER_HOME_ID',
  'EXPO_PUBLIC_ADMOB_IOS_BANNER_HOME_ID',
  'EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ALERTS_ID',
  'EXPO_PUBLIC_ADMOB_IOS_BANNER_ALERTS_ID',
  'EXPO_PUBLIC_ADMOB_ANDROID_NATIVE_PRODUCTS_ID',
  'EXPO_PUBLIC_ADMOB_IOS_NATIVE_PRODUCTS_ID',
  'EXPO_PUBLIC_ADMOB_ANDROID_NATIVE_REPORTS_ID',
  'EXPO_PUBLIC_ADMOB_IOS_NATIVE_REPORTS_ID',
]) {
  requireValue(app.extra?.[key], `${key} is required`);
}

for (const file of ['eas.json', 'app-ads.txt', 'docs/PRIVACY_POLICY.md', 'docs/TERMS_OF_USE.md', 'docs/07_RELEASE_CHECKLIST.md', 'docs/08_STORE_LISTING.md', 'docs/09_APP_REVIEW_NOTES.md', 'docs/10_ADMOB_PUBLISHING.md', 'docs/11_APP_REVIEW_4_3.md', 'docs/12_STORE_CONSOLE_DATA.md']) {
  if (!fs.existsSync(file)) failures.push(`${file} is required`);
}

for (const asset of [
  app.icon,
  app.splash?.image,
  app.android?.adaptiveIcon?.foregroundImage,
  app.android?.adaptiveIcon?.backgroundImage,
  app.ios?.icon,
]) {
  if (asset && !fs.existsSync(asset)) failures.push(`${asset} is missing`);
}

for (const dependency of ['expo-font', 'expo-constants', 'expo-linking', 'react-native-google-mobile-ads']) {
  if (!pkg.dependencies?.[dependency]) failures.push(`${dependency} must be a direct dependency`);
}

if (pkg.dependencies?.['react-native-google-mobile-ads'] !== '16.3.0') {
  failures.push('react-native-google-mobile-ads must stay pinned to 16.3.0 for Expo 54 Kotlin compatibility');
}

if (!fs.existsSync('package-lock.json')) {
  failures.push('package-lock.json is required for reproducible builds');
}

for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  if (version === '*' || version === 'latest' || String(version).trim() === '') {
    failures.push(`${name} must use a bounded dependency version`);
  }
}

for (const file of ['app/_layout.tsx', 'src/database/db.ts', 'src/services/backupService.ts']) {
  const source = fs.readFileSync(file, 'utf8');
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(source)) {
    failures.push(`${file} contains private key material`);
  }
}

if (app.extra?.EXPO_PUBLIC_ADS_TEST_MODE === 'true') {
  failures.push('Production config must not enable AdMob test mode');
}

const settingsSource = fs.readFileSync('app/(tabs)/settings.tsx', 'utf8');
for (const url of [
  'https://sites.google.com/view/jwm-devcreator/privacidade/estoqueguard',
  'https://sites.google.com/view/jwm-devcreator/p%C3%A1gina-inicial',
]) {
  if (!settingsSource.includes(url)) failures.push(`Missing stable in-app legal URL: ${url}`);
}

if (!settingsSource.includes("router.push('/terms')") || !fs.existsSync('app/terms.tsx')) {
  failures.push('Terms of use must remain available inside the app');
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Release configuration audit passed.');
