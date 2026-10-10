export const WALLET_VIEW = {
  PLAYER_TITLE: 'Wallet',
  STAFF_TITLE: 'Transactions',
  UPDATED_PREFIX: 'Last updated ',
  STAFF_SUBTITLE: 'Every wallet movement across the platform.',
  SECTION_TITLE: 'Transactions',
  FILTERS_LABEL: 'Filter transactions',
  REFRESH_LABEL: 'Refresh',
  EXPORT_LABEL: 'Export CSV',
  EMPTY: 'No transactions yet',
  DAY_FORMAT: 'EEEE, MMM d',
  PLACEHOLDER_ROWS: 4,
  PAGE_SIZES: [10, 25, 50, 100],
  DEFAULT_PAGE_SIZE: 25,
  FILTER_ALL: 'ALL',
  FILTERS: [
    { id: 'ALL', label: 'All', types: [] },
    { id: 'IN', label: 'In', types: ['DEPOSIT'] },
    { id: 'OUT', label: 'Out', types: ['WITHDRAWAL', 'FEE'] },
    { id: 'GAMES', label: 'Games', types: ['BET_STAKE', 'BET_PAYOUT', 'BET_REFUND'] }
  ] as { id: string; label: string; types: string[] }[]
} as const;
