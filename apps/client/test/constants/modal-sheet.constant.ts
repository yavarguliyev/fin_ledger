import { join } from 'node:path';

const APP = join(__dirname, '..', '..', 'src', 'app');

export const MODAL_SHEET_TEST = {
  TEMPLATES: [
    join(APP, 'shared', 'components', 'modal', 'modal.component.html'),
    join(APP, 'features', 'profile', 'payment-methods', 'templates', 'add-payment-method-modal.component.html')
  ],
  ENCODING: 'utf8',
  BACKDROP: /fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4/,
  SHEET: /class="[^"]*\bh-\[100dvh\] sm:h-auto\b[^"]*\brounded-none sm:rounded-2xl\b[^"]*"\s*role="dialog"/
} as const;
