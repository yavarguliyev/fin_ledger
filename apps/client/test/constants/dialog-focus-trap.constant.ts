import { join } from 'node:path';

export const DIALOG_FOCUS_TRAP_TEST = {
  APP_ROOT: join(__dirname, '..', '..', 'src', 'app'),
  ENCODING: 'utf8',
  TRAP: 'appFocusTrap',
  DIALOGS: [
    join('shared', 'components', 'modal', 'modal.component.html'),
    join('features', 'support', 'templates', 'delete-dialog.component.html'),
    join('layout', 'templates', 'call-overlay.component.html'),
    join('features', 'profile', 'payment-methods', 'templates', 'add-payment-method-modal.component.html')
  ]
} as const;
