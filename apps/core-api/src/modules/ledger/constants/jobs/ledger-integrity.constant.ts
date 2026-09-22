export const LEDGER_INTEGRITY = {
  DEFAULT_INTERVAL_MS: 5 * 60_000,
  VIEWS: {
    ACCOUNT_DRIFT: 'v_ledger_balance_drift',
    WALLET_DRIFT: 'v_wallet_ledger_drift',
    TRIAL_BALANCE: 'v_trial_balance'
  }
} as const;
