export const IMAGE_UPLOAD_SPEC = {
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED: 415,
  SERVER_MESSAGE: 'IMG_7371.dng: Only JPEG, PNG, WebP, GIF, AVIF and TIFF images are accepted',
  MULTER_MESSAGE: 'File too large',
  TOO_LARGE: 'Each image must be 10 MB or smaller',
  FALLBACK: 'Failed to upload images',
  RAW: { fileName: 'IMG_7371.dng', reason: 'Only JPEG, PNG, WebP, GIF, AVIF and TIFF images are accepted' },
  HEIC: { fileName: 'IMG_7372.HEIC', reason: 'Only JPEG, PNG, WebP, GIF, AVIF and TIFF images are accepted' },
  UPLOADED: 3,
  SMALL_BYTES: 1024,
  SMALL_NAME: 'IMG_0001.JPG',
  BIG_BYTES: 12 * 1024 * 1024 + 300 * 1024,
  BIG_NAME: 'IMG_0002.JPG',
  NAMED_TOO_LARGE: 'Too large: IMG_0002.JPG (12.3 MB). Each image must be 10 MB or smaller.',
  PARTIAL:
    'Uploaded 3 of 5 images. IMG_7371.dng: Only JPEG, PNG, WebP, GIF, AVIF and TIFF images are accepted · IMG_7372.HEIC: Only JPEG, PNG, WebP, GIF, AVIF and TIFF images are accepted'
} as const;
