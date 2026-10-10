import { NotificationType } from '../../types/notification/notification-type.type';
import { IconName } from '../../types/ui/icon-name.type';

export const NOTIFICATION_DISPLAY_FALLBACK = {
  ICON: 'bell',
  CLASS: 'bg-ink-100 text-ink-500'
} as const;

export const NOTIFICATION_ICONS: Record<NotificationType, IconName> = {
  BET_WON: 'trophy',
  INFO: 'bell',
  PAYMENT_COMPLETED: 'credit-card',
  PAYMENT_FAILED: 'triangle-alert',
  SYSTEM: 'settings',
  WALLET_CREDITED: 'arrow-down-to-line',
  WALLET_DEBITED: 'arrow-up-from-line'
};

export const NOTIFICATION_CLASSES: Record<NotificationType, string> = {
  BET_WON: 'bg-warning/10 text-warning-deep dark:text-warning-light',
  INFO: 'bg-ink-100 text-ink-500',
  PAYMENT_COMPLETED: 'bg-success/10 text-success-deep dark:text-success-light',
  PAYMENT_FAILED: 'bg-danger/10 text-danger-deep dark:text-danger-light',
  SYSTEM: 'bg-ink-100 text-ink-500',
  WALLET_CREDITED: 'bg-primary/10 text-primary',
  WALLET_DEBITED: 'bg-primary/10 text-primary'
};
