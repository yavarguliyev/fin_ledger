export const PDF_TEXT = {
  BINARY: 'latin1',
  HEX: 'hex',
  EMPTY: '',
  STREAM_PATTERN: /stream\r?\n([\s\S]*?)\r?\nendstream/g,
  HEX_PATTERN: /<([0-9a-fA-F]+)>/g,
  MAGIC: '%PDF-'
} as const;
