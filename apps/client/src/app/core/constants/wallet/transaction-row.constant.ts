export const TRANSACTION_ROW = {
  DATE_TIME_FORMAT: "MMM d '·' h:mm a",
  TIME_FORMAT: 'h:mm a',
  POSITIVE_SIGN: '+',
  AMOUNT: { NEGATIVE: 'text-loss', POSITIVE: 'text-win' },
  FALLBACK: { TITLE: 'Wallet activity', TONE: 'bg-pending/15 text-pending', STATUS: 'bg-surface-2 text-text-muted' },
  TITLES: {
    DEPOSIT: 'Deposit to wallet',
    WITHDRAWAL: 'Withdrawal from wallet',
    BET_STAKE: 'Stake on a game',
    BET_PAYOUT: 'You won a game',
    BET_REFUND: 'Stake refunded',
    FEE: 'Fee charged',
    ADJUSTMENT: 'Balance adjustment'
  } as Record<string, string>,
  TONES: {
    DEPOSIT: 'bg-win/15 text-win',
    WITHDRAWAL: 'bg-loss/15 text-loss',
    BET_STAKE: 'bg-loss/15 text-loss',
    BET_PAYOUT: 'bg-win/15 text-win',
    BET_REFUND: 'bg-win/15 text-win',
    FEE: 'bg-loss/15 text-loss',
    ADJUSTMENT: 'bg-pending/15 text-pending'
  } as Record<string, string>,
  STATUSES: {
    COMPLETED: 'bg-win/15 text-win',
    PENDING: 'bg-pending/15 text-pending',
    FAILED: 'bg-loss/15 text-loss',
    CANCELLED: 'bg-surface-2 text-text-muted'
  } as Record<string, string>
} as const;
