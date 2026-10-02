export interface TestPaymentRequest {
  email: string;
  walletId: string;
  currency: string;
  methodId: string;
  status?: string;
}
