export const DASHBOARD_STATS = {
  DEPOSITS: { LABEL: 'Total deposits', ICON: 'arrow-down-to-line', TONE: 'bg-win/15 text-win', SPARK: 'text-win' },
  WITHDRAWALS: { LABEL: 'Total withdrawals', ICON: 'arrow-up-from-line', TONE: 'bg-loss/15 text-loss', SPARK: 'text-loss' },
  BETS: { LABEL: 'Games played', ICON: 'target', TONE: 'bg-live/15 text-live', SPARK: 'text-live' },
  WINNINGS: { LABEL: 'Total winnings', ICON: 'trophy', TONE: 'bg-pending/15 text-pending', SPARK: 'text-pending' }
} as const;
