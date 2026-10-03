export interface CompletionWallet {
  id: string;
  currency: string;
  balance: number;
}

export interface CompletionBalanceRow {
  balance: number;
}

export interface CompletionIdRow {
  id: string;
}

export interface CompletionChargeRow {
  id: string;
  provider_charge_id: string;
}

export interface CompletionDeposit {
  id: string;
  providerChargeId: string;
}

export interface CompletionPaymentDto {
  paymentId: string;
}

export interface CompletionWebhookDto {
  type: string;
  chargeId: string;
  metadata?: Record<string, string>;
}
