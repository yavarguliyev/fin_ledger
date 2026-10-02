export const STORAGE_ERRORS = {
  IMAGE_TOO_LARGE: 'The image dimensions are too large',
  UNPROCESSABLE_IMAGE: 'The image could not be processed',
  UNSUPPORTED_IMAGE:
    'Only JPEG, PNG, WebP, GIF, AVIF and TIFF images are accepted. iPhone HEIC and RAW (DNG) photos are not supported yet: export them as JPEG, or set Camera › Formats › Most Compatible'
} as const;
