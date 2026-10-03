export interface StripeClientFakeDto {
  paymentIntents?: Record<string, (...args: never[]) => Promise<unknown>>;
  charges?: Record<string, (...args: never[]) => Promise<unknown>>;
  customers?: Record<string, (...args: never[]) => Promise<unknown>>;
  checkout?: { sessions: Record<string, (...args: never[]) => Promise<unknown>> };
}
