export interface FreshWallet {
  id: string;
  availableBalanceMinor: number;
}

export interface FreshWalletRow {
  id: string;
  currency: string;
}

export interface FreshIdRow {
  id: string;
}

export interface FreshBalanceRow {
  balance: number;
}

export interface FreshChargeRow {
  provider_charge_id: string;
}

export interface FreshPayment {
  id: string;
  status: string;
}
