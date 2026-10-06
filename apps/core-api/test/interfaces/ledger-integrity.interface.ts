export interface IntegrityReport {
  driftedAccounts: number;
  driftedWallets: number;
  unbalancedCurrencies: string[];
  healthy: boolean;
}

export interface BalanceShift {
  delta: number;
}
