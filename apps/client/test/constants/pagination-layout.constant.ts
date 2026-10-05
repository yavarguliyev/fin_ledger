import { join } from 'node:path';

export const PAGINATION_LAYOUT_TEST = {
  TEMPLATE: join(__dirname, '..', '..', 'src', 'app', 'shared', 'components', 'pagination', 'pagination.component.html'),
  ENCODING: 'utf8',
  ROW_CLASSES: /<div class="([^"]*)"/g,
  WRAP: 'flex-wrap',
  WRAPPING_ROWS: 2,
  LABELLED_SELECT: /<label[^>]*>\s*Rows per page:\s*<select/
} as const;
