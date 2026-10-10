import { IconName } from '../../types/ui/icon-name.type';
import { TRANSACTION_ICONS, TRANSACTION_DISPLAY_FALLBACK } from '../../constants/wallet/transaction-display.constant';

export class TransactionHelper {
  static formatType (type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  static statusClass (status: string): string {
    const map: Record<string, string> = {
      COMPLETED: 'bg-success/10 text-success-deep dark:text-success-light',
      PENDING: 'bg-warning/10 text-warning-deep dark:text-warning-light',
      FAILED: 'bg-danger/10 text-danger-deep dark:text-danger-light',
      CANCELLED: 'bg-ink-100 text-ink-500'
    };

    return map[status] ?? 'bg-ink-100 text-ink-500';
  }

  static typeIcon (type: string): IconName {
    return TRANSACTION_ICONS[type] ?? TRANSACTION_DISPLAY_FALLBACK.ICON;
  }

  static typeClass (type: string): string {
    const map: Record<string, string> = {
      DEPOSIT: 'bg-success/10 text-success-deep dark:text-success-light',
      WITHDRAWAL: 'bg-danger/10 text-danger-deep dark:text-danger-light',
      BET_STAKE: 'bg-primary/10 text-primary',
      BET_PAYOUT: 'bg-warning/10 text-warning-deep dark:text-warning-light',
      BET_REFUND: 'bg-info/10 text-info',
      FEE: 'bg-danger/10 text-danger-deep dark:text-danger-light',
      ADJUSTMENT: 'bg-ink-100 text-ink-500'
    };

    return map[type] ?? 'bg-ink-100 text-ink-500';
  }
}
