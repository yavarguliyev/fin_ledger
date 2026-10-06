import { join } from 'node:path';

export const RESPONSIVE_GRIDS_TEST = {
  APP_ROOT: join(__dirname, '..', '..', 'src', 'app'),
  EXTENSION: '.html',
  ENCODING: 'utf8',
  CLASS_ATTRIBUTE: /class="([^"]*)"/g,
  GRID: /(^|\s)grid(\s|$)/,
  RESPONSIVE_COLUMNS: /(^|\s)(sm|md|lg|xl):grid-cols-/,
  BASE_COLUMNS: /(^|\s)grid-cols-\d/,
  SEPARATOR: ':'
} as const;
