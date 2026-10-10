import { IconName } from '../../types/ui/icon-name.type';
import { ToastType } from '../../types/ui/toast-type.type';

export const TOAST = { DEFAULT_TYPE: 'info', DISMISS_MS: 5_000 } as const;

export const TOAST_ICONS: Record<ToastType, IconName> = {
  error: 'circle-x',
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert'
};
