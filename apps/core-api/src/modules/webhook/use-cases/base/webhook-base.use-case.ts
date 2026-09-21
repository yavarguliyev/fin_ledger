import { Inject } from '@nestjs/common';
import { OutboxRepository, PaymentMethodStatus, PaymentStatus } from '@common/libs';

import { PaymentRepository } from '../../../payment/repositories/payment.repository';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';

export abstract class WebhookBaseUseCase<TInput, TOutput> {
  @Inject(OutboxRepository)
  protected readonly outboxRepository!: OutboxRepository;

  @Inject(PaymentRepository)
  protected readonly paymentRepository!: PaymentRepository;

  @Inject(PaymentMethodRepository)
  protected readonly paymentMethodRepository!: PaymentMethodRepository;

  readonly paymentMethodEvents: Record<string, PaymentMethodStatus> = {
    'payment_method.attached': PaymentMethodStatus.VERIFIED,
    'setup_intent.succeeded': PaymentMethodStatus.VERIFIED,
    'setup_intent.setup_failed': PaymentMethodStatus.REJECTED,
    'checkout.session.completed': PaymentMethodStatus.VERIFIED
  };

  readonly paymentChargeEvents: Record<string, PaymentStatus> = {
    'payment_intent.succeeded': PaymentStatus.COMPLETED,
    'payment_intent.created': PaymentStatus.PENDING,
    'payment_intent.payment_failed': PaymentStatus.FAILED,
    'charge.succeeded': PaymentStatus.COMPLETED,
    'charge.updated': PaymentStatus.PROCESSING,
    'charge.failed': PaymentStatus.FAILED
  };

  abstract execute(input: TInput): Promise<TOutput>;
}
