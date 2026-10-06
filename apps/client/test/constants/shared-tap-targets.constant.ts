import { join } from 'node:path';

const SHARED = join(__dirname, '..', '..', 'src', 'app', 'shared', 'components');

export const SHARED_TAP_TARGETS_TEST = {
  PAGINATION: join(SHARED, 'pagination', 'pagination.component.html'),
  MODAL: join(SHARED, 'modal', 'modal.component.html'),
  GLOBAL_STYLES: join(__dirname, '..', '..', 'src', 'global_styles.css'),
  ENCODING: 'utf8',
  PAGINATION_BUTTON: /'([^']*rounded-lg[^']*)'|<button[\s\S]*?class="([^"]*)"/g,
  PAGINATION_CLASSES: ['min-h-11', 'min-w-11'],
  MODAL_CLOSE: /\(click\)="onClose\(\)"\s*class="[^"]*\bh-11 w-11\b/,
  ACTION_ICON: /\.action-icon \{[^}]*width: theme\('spacing\.11'\);\s*height: theme\('spacing\.11'\);/,
  EMPTY: '',
  SPACE: ' '
} as const;
