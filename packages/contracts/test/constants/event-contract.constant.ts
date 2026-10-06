export const EVENT_CONTRACT_TEST = {
  UNKNOWN_TYPE: 'email.password_reset',
  BET: {
    betId: 'bet-1',
    userId: 'user-1',
    walletId: 'wallet-1',
    status: 'WON',
    selection: 'Home',
    payoutMinor: 2500,
    currency: 'USD'
  },
  BAD_STATUS: 'MAYBE',
  MISSING_FIELD: 'walletId'
} as const;
