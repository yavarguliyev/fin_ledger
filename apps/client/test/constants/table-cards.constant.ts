import { join } from 'node:path';

export const TABLE_CARDS_TEST = {
  APP_ROOT: join(__dirname, '..', '..', 'src', 'app'),
  DATA_TABLE: join(__dirname, '..', '..', 'src', 'app', 'shared', 'components', 'data-table', 'data-table.component.html'),
  EXTENSION: '.html',
  ENCODING: 'utf8',
  RAW_TABLE: '<table ',
  DESKTOP_TABLE: /<table class="[^"]*\bhidden md:table\b/,
  PHONE_CARDS: /<div class="md:hidden\b/
} as const;
