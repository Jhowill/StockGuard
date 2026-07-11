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

for (const file of ['README.md', '.env.example', 'eas.json', 'docs/PRIVACY_POLICY.md', 'docs/TERMS_OF_USE.md', 'docs/07_RELEASE_CHECKLIST.md']) {
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

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Release configuration audit passed.');
