export const IMAGE_FORMATS = {
  OUTPUT_BY_INPUT: { gif: 'png', heif: 'png', jpeg: 'jpeg', png: 'png', tiff: 'png', webp: 'webp' },
  MIME_TYPES: { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' },
  EXTENSIONS: { jpeg: '.jpg', png: '.png', webp: '.webp' },
  EXTENSION_PATTERN: /\.[^.]+$/,
  HEIF_FORMAT: 'heif',
  HEVC_COMPRESSION: 'hevc',
  HEVC_OUTPUT: 'jpeg',
  RAW_CHANNELS: 4
} as const;
