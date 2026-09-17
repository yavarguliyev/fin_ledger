import { PaymentMethodStatus, PaymentStatus } from '@common/libs';

export abstract class WebhookBaseUseCase<TInput, TOutput> {
  readonly paymentMethodEvents: Record<string, PaymentMethodStatus> = {
    'payment_method.attached': PaymentMethodStatus.VERIFIED,
    'setup_intent.succeeded': PaymentMethodStatus.VERIFIED,
    'setup_intent.setup_failed': PaymentMethodStatus.REJECTED,
    'checkout.session.completed': PaymentMethodStatus.VERIFIED
  };

  readonly paymentChargeEvents: Record<string, PaymentStatus> = {
    'payment_intent.succeeded': PaymentStatus.COMPLETED,
    'payment_intent.created': PaymentStatus.CREATED,
    'payment_intent.payment_failed': PaymentStatus.FAILED,
    'charge.succeeded': PaymentStatus.COMPLETED,
    'charge.updated': PaymentStatus.CREATED,
    'charge.failed': PaymentStatus.FAILED
  };

  abstract execute(input: TInput): Promise<TOutput>;
}
