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
