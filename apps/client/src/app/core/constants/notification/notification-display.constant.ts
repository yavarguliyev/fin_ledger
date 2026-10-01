import { NotificationType } from '../../types/notification/notification-type.type';

export const NOTIFICATION_DISPLAY_FALLBACK = {
  ICON: '🔔',
  CLASS: 'bg-ink-100 text-ink-500'
} as const;

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  BET_WON: '🎯',
  INFO: '🔔',
  PAYMENT_COMPLETED: '💳',
  PAYMENT_FAILED: '⚠️',
  SYSTEM: '⚙️',
  WALLET_CREDITED: '👛',
  WALLET_DEBITED: '👛'
};

export const NOTIFICATION_CLASSES: Record<NotificationType, string> = {
  BET_WON: 'bg-warning/10 text-warning',
  INFO: 'bg-ink-100 text-ink-500',
  PAYMENT_COMPLETED: 'bg-success/10 text-success',
  PAYMENT_FAILED: 'bg-danger/10 text-danger',
  SYSTEM: 'bg-ink-100 text-ink-500',
  WALLET_CREDITED: 'bg-primary/10 text-primary',
  WALLET_DEBITED: 'bg-primary/10 text-primary'
};
