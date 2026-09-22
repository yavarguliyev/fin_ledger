export enum PaymentOperation {
  REFUND = 'refund'
}

export class IdempotencyHelper {
  static forPayment (operation: PaymentOperation, paymentId: string): string {
    return `${operation}:${paymentId}`;
  }
}
