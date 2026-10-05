export interface AnalyticsEventDto {
  eventType: string;
}

export interface AnalyticsWebhookDto {
  type: string;
  chargeId: string;
}

export interface AnalyticsDepositDto {
  idempotencyKey: string;
}

export interface AnalyticsDeposit {
  id: string;
  providerChargeId: string;
}

export interface AnalyticsWalletRow {
  id: string;
  currency: string;
}

export interface AnalyticsIdRow {
  id: string;
}

export interface AnalyticsCountRow {
  count: number;
}
