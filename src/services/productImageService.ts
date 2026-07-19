import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';

const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;

function imageExtension(uri: string) {
  const normalized = uri.toLowerCase().split(/[?#]/)[0];
  if (normalized.endsWith('.png')) return 'png';
  if (normalized.endsWith('.webp')) return 'webp';
  return 'jpg';
}

function managedImageFolder() {
  const root = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  return root ? `${root}product-images/` : null;
}

export function isManagedProductImage(uri?: string | null) {
  const folder = managedImageFolder();
  return Boolean(folder && uri?.startsWith(folder));
}

export async function deleteManagedProductImage(uri?: string | null) {
  if (!uri || !isManagedProductImage(uri)) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Image cleanup is best effort and must never interrupt a product operation.
  }
}

export async function persistProductImage(sourceUri: string) {
  if (!sourceUri.trim()) throw new Error('PRODUCT_IMAGE_MISSING');
  const sourceInfo = await FileSystem.getInfoAsync(sourceUri);
  const sourceSize = (sourceInfo as { size?: number }).size;
  if (!sourceInfo.exists || sourceInfo.isDirectory) throw new Error('PRODUCT_IMAGE_MISSING');
  if (typeof sourceSize === 'number' && sourceSize > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error('PRODUCT_IMAGE_TOO_LARGE');
  }

  const folder = managedImageFolder();
  if (!folder) throw new Error('PRODUCT_IMAGE_FOLDER_UNAVAILABLE');
  const folderInfo = await FileSystem.getInfoAsync(folder);
  if (!folderInfo.exists) await FileSystem.makeDirectoryAsync(folder, { intermediates: true });

  const destination = `${folder}${Crypto.randomUUID()}.${imageExtension(sourceUri)}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destination });
  const destinationInfo = await FileSystem.getInfoAsync(destination);
  if (!destinationInfo.exists || destinationInfo.isDirectory) throw new Error('PRODUCT_IMAGE_COPY_FAILED');
  return destination;
}
