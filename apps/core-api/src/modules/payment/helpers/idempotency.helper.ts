import { PaymentIdempotencyKeyDto } from '../dtos/helper/payment-idempotency-key.dto';

export class IdempotencyHelper {
  static forPayment ({ operation, paymentId }: PaymentIdempotencyKeyDto): string {
    return `${operation}:${paymentId}`;
  }
}
