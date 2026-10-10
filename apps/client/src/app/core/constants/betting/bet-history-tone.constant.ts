export const BET_HISTORY_TONE = {
  STATUS: {
    WON: 'bg-win/15 text-win',
    PENDING: 'bg-pending/15 text-pending',
    LOST: 'bg-loss/15 text-loss',
    VOIDED: 'bg-surface-2 text-text-muted',
    CASHED_OUT: 'bg-surface-2 text-text-muted'
  } as Record<string, string>,
  PAID: 'font-semibold text-win',
  UNPAID: 'text-text-muted'
} as const;
