import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const PIN_HASH_KEY = 'estoqueguard.pin.hash';
const BIOMETRIC_ENABLED_KEY = 'estoqueguard.biometric.enabled';

async function hashPin(pin: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export async function setPin(pin: string) {
  const hashed = await hashPin(pin);
  await SecureStore.setItemAsync(PIN_HASH_KEY, hashed);
  return hashed;
}

export async function verifyPin(pin: string) {
  try {
    const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
    if (!stored) {
      return false;
    }

    return stored === (await hashPin(pin));
  } catch {
    return false;
  }
}

export async function clearPin() {
  await SecureStore.deleteItemAsync(PIN_HASH_KEY);
}

export async function hasPin() {
  try {
    return Boolean(await SecureStore.getItemAsync(PIN_HASH_KEY));
  } catch {
    return false;
  }
}

export async function enableBiometricLock() {
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, '1');
  return true;
}

export async function disableBiometricLock() {
  await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
}

export async function clearSecuritySecrets() {
  try {
    await Promise.all([clearPin(), disableBiometricLock()]);
  } catch {
    // Best-effort cleanup; data wipe should not fail solely because SecureStore is unavailable.
  }
}

export async function isBiometricEnabled() {
  try {
    return (await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function canUseBiometricUnlock() {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && enrolled;
  } catch {
    return false;
  }
}

export async function authenticateWithBiometric() {
  return LocalAuthentication.authenticateAsync({
    promptMessage: 'Desbloquear EstoqueGuard',
    fallbackLabel: 'Usar PIN',
  });
}
