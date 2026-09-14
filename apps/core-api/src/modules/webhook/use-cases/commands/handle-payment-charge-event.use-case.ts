import { Injectable, Logger } from '@nestjs/common';
import { DomainEventType, PaymentStatus, OutboxRepository, PostgresService, PaymentProviderRegistry } from '@common/libs';

import { PaymentRepository } from '../../../payment/repositories/payment.repository';
import { HandlePaymentChargeEventInput } from '../../dtos/request/handle-webhook.dto';
import { WebhookBaseUseCase } from '../base/webhook-base.use-case';
import { WebhookEventRepository } from '../../repositories/webhook-event.repository';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';

@Injectable()
export class HandlePaymentChargeEventUseCase extends WebhookBaseUseCase<HandlePaymentChargeEventInput, void> {
  private readonly logger = new Logger(HandlePaymentChargeEventUseCase.name);

  constructor (
    protected override readonly paymentRepository: PaymentRepository,
    protected override readonly outboxRepository: OutboxRepository,
    protected override readonly postgresService: PostgresService,
    protected override readonly webhookEventRepository: WebhookEventRepository,
    protected override readonly providerRegistry: PaymentProviderRegistry,
    protected override readonly paymentMethodRepository: PaymentMethodRepository
  ) {
    super(paymentRepository, outboxRepository, postgresService, webhookEventRepository, providerRegistry, paymentMethodRepository);
  }

  async execute ({ provider, payload, status }: HandlePaymentChargeEventInput): Promise<void> {
    const dataObj = (payload['data'] as Record<string, unknown>) ?? payload;
    const obj = (dataObj['object'] as Record<string, unknown>) ?? dataObj;
    const providerChargeId = (obj['id'] as string) || '';

    if (!providerChargeId) {
      return;
    }

    const payment = await this.paymentRepository.findByProviderChargeId(provider, providerChargeId);
    if (!payment) {
      this.logger.warn(`Payment not found for provider charge ID: ${providerChargeId}`);
      return;
    }

    await this.paymentRepository.updatePaymentStatus(payment.id, { status });
    await this.outboxRepository.createEvent({
      aggregateType: 'Payment',
      aggregateId: payment.id,
      eventType: status === PaymentStatus.COMPLETED ? DomainEventType.PAYMENT_COMPLETED : DomainEventType.PAYMENT_FAILED,
      payload: {
        paymentId: payment.id,
        userId: payment.userId,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        status,
        provider,
        providerChargeId
      }
    });
  }
}
