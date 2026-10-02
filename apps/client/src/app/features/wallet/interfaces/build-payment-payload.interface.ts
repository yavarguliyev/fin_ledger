export interface BuildPaymentPayloadDto {
  amountMinor: number;
  currency: string;
  idempotencyKey: string;
}
