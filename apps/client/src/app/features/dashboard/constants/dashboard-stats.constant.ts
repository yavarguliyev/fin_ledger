export const DASHBOARD_STATS = {
  DEPOSITS: { LABEL: 'Total Deposits', ICON: 'arrow-down-to-line', TONE: 'bg-win/15 text-win' },
  WITHDRAWALS: { LABEL: 'Total Withdrawals', ICON: 'arrow-up-from-line', TONE: 'bg-loss/15 text-loss' },
  BETS: { LABEL: 'Bets Placed', ICON: 'target', TONE: 'bg-live/15 text-live' },
  WINNINGS: { LABEL: 'Total Winnings', ICON: 'trophy', TONE: 'bg-pending/15 text-pending' }
} as const;
