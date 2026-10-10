export const DASHBOARD_STATS = {
  DEPOSITS: { LABEL: 'Total Deposits', ICON: 'arrow-down-to-line', TONE: 'bg-success/10 text-success-deep dark:text-success-light' },
  WITHDRAWALS: { LABEL: 'Total Withdrawals', ICON: 'arrow-up-from-line', TONE: 'bg-danger/10 text-danger-deep dark:text-danger-light' },
  BETS: { LABEL: 'Bets Placed', ICON: 'target', TONE: 'bg-primary/10 text-primary' },
  WINNINGS: { LABEL: 'Total Winnings', ICON: 'trophy', TONE: 'bg-warning/10 text-warning-deep dark:text-warning-light' }
} as const;
