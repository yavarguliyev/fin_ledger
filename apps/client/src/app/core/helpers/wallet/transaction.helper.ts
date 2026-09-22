export class TransactionHelper {
  static formatType (type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  static statusClass (status: string): string {
    const map: Record<string, string> = {
      COMPLETED: 'bg-success/10 text-success',
      PENDING: 'bg-warning/10 text-warning',
      FAILED: 'bg-danger/10 text-danger',
      CANCELLED: 'bg-ink-100 text-ink-500'
    };

    return map[status] ?? 'bg-ink-100 text-ink-500';
  }

  static typeIcon (type: string): string {
    const map: Record<string, string> = {
      DEPOSIT: '↓',
      WITHDRAWAL: '↑',
      BET_STAKE: '🎯',
      BET_PAYOUT: '🏆',
      BET_REFUND: '↩',
      FEE: '−',
      ADJUSTMENT: '±'
    };

    return map[type] ?? '•';
  }

  static typeClass (type: string): string {
    const map: Record<string, string> = {
      DEPOSIT: 'bg-success/10 text-success',
      WITHDRAWAL: 'bg-danger/10 text-danger',
      BET_STAKE: 'bg-primary/10 text-primary',
      BET_PAYOUT: 'bg-warning/10 text-warning',
      BET_REFUND: 'bg-info/10 text-info',
      FEE: 'bg-danger/10 text-danger',
      ADJUSTMENT: 'bg-ink-100 text-ink-500'
    };

    return map[type] ?? 'bg-ink-100 text-ink-500';
  }
}
