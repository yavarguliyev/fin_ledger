export enum PaymentOperation {
  CHARGE = 'charge',
  PAYOUT = 'payout',
  REFUND = 'refund',
  REVERSAL = 'reversal'
}

export class IdempotencyHelper {
  static forPayment (operation: PaymentOperation, paymentId: string): string {
    return `${operation}:${paymentId}`;
  }
}
