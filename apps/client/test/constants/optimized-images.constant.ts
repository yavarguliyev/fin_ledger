import { join } from 'node:path';

export const OPTIMIZED_IMAGES_TEST = {
  APP_ROOT: join(__dirname, '..', '..', 'src', 'app'),
  TEMPLATE_EXTENSION: '.html',
  ENCODING: 'utf8',
  IMAGE: /<img\b[^>]*>/g,
  OPTIMIZED: /\[ngSrc\]=/,
  SIZED: /\bfill\b|\bwidth="\d+"[^>]*\bheight="\d+"/,
  DATA_URL_SOURCE: /DataUrl/,
  NEWLINE: '\n',
  SEPARATOR: ':'
} as const;
