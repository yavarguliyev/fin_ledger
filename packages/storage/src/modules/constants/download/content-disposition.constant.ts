export const CONTENT_DISPOSITION = {
  INLINE: 'inline',
  ATTACHMENT: 'attachment',
  VALUES: ['inline', 'attachment'],
  FALLBACK_NAME: 'download',
  UNSAFE_ASCII: /[^\x20-\x7e]|["\\]/g,
  REPLACEMENT: '_',
  SEPARATOR: '; ',
  ENCODING_PREFIX: "UTF-8''"
} as const;
