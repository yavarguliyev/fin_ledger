export interface OpenDeposit {
  id: string;
  status: string;
  clientSecret?: string;
}

export interface OpenWalletRow {
  id: string;
  currency: string;
}

export interface OpenIdRow {
  id: string;
}

export interface OpenBalanceRow {
  balance: number;
}

export interface OpenChargeRow {
  provider_charge_id: string;
}

export interface OpenFailureRow {
  status: string;
  failure_code: string;
}

export interface OpenPaymentDto {
  paymentId: string;
}

export interface OpenDepositDto {
  card: string;
  idempotencyKey: string;
}
