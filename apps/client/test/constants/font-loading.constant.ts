import { join } from 'node:path';

export const FONT_LOADING_TEST = {
  INDEX_HTML: join(__dirname, '..', '..', 'src', 'index.html'),
  GLOBAL_STYLES: join(__dirname, '..', '..', 'src', 'global_styles.css'),
  ENCODING: 'utf8',
  PRECONNECTS: ['<link rel="preconnect" href="https://fonts.googleapis.com" />', '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />'],
  STYLESHEET: /<link\s+rel="stylesheet"\s+href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter/,
  CSS_IMPORT: '@import url('
} as const;
