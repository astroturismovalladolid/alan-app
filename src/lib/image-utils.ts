/**
 * Utility functions for image handling and optimization
 */

/**
 * Convert a data URL to a Blob object
 * @param dataUrl - Base64 encoded data URL (e.g., "data:image/jpeg;base64,...")
 * @returns Blob object that can be uploaded to Firebase Storage
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Generate thumbnail URL from original image URL
 * This assumes the Firebase "Resize Images" extension is installed
 * and configured to create thumbnails with the suffix "_400x400.webp"
 *
 * @param originalUrl - Original image URL from Firebase Storage
 * @param originalFileName - Original filename (e.g., "observation_123.jpg")
 * @returns Expected thumbnail URL after extension processing
 */
export function getThumbnailUrl(originalUrl: string, originalFileName: string): string {
  const thumbnailName = originalFileName.replace(/\.(jpg|jpeg|png)$/i, '_400x400.webp');
  return originalUrl.replace(originalFileName, thumbnailName);
}

/**
 * Get optimized cache control headers for Firebase Storage uploads
 * These headers ensure maximum caching efficiency and reduce egress costs
 *
 * @returns Metadata object with cache control settings
 */
export function getImageMetadata(contentType: string = 'image/jpeg') {
  return {
    contentType,
    cacheControl: 'public, max-age=31536000, immutable', // Cache for 1 year
  };
}

/**
 * Get the display URL for an observation image
 * Prefers thumbnail for bandwidth savings, falls back to original
 *
 * @param thumbnailUrl - Optimized thumbnail URL (if available)
 * @param imageUrl - Original full-resolution URL (fallback)
 * @returns URL to display in the UI
 */
export function getDisplayImageUrl(thumbnailUrl: string | undefined, imageUrl: string): string {
  return thumbnailUrl || imageUrl;
}
