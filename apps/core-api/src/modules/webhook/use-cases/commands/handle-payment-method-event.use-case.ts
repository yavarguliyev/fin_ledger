import { Injectable, Logger } from '@nestjs/common';
import { DomainEventType, PaymentMethodStatus, OutboxRepository, PostgresService, PaymentProviderRegistry } from '@common/libs';

import { PaymentRepository } from '../../../payment/repositories/payment.repository';
import { HandlePaymentMethodEventInput } from '../../dtos/request/handle-webhook.dto';
import { WebhookEventRepository } from '../../repositories/webhook-event.repository';
import { WebhookBaseUseCase } from '../base/webhook-base.use-case';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';

@Injectable()
export class HandlePaymentMethodEventUseCase extends WebhookBaseUseCase<HandlePaymentMethodEventInput, void> {
  private readonly logger = new Logger(HandlePaymentMethodEventUseCase.name);

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

  async execute ({ provider, payload, status }: HandlePaymentMethodEventInput): Promise<void> {
    const dataObj = (payload['data'] as Record<string, unknown>) ?? payload;
    const obj = (dataObj['object'] as Record<string, unknown>) ?? dataObj;
    const providerMethodId = (obj['id'] as string) || (obj['payment_method'] as string);

    if (!providerMethodId) return;

    const method = await this.paymentMethodRepository.findByProviderMethodId(provider, providerMethodId);
    if (!method) {
      this.logger.warn(`Payment method not found for provider method ID: ${providerMethodId}`);
      return;
    }

    await this.paymentMethodRepository.updateStatus(method.id, status);

    const eventType = status === PaymentMethodStatus.VERIFIED ? DomainEventType.PAYMENT_METHOD_VERIFIED : DomainEventType.PAYMENT_METHOD_REJECTED;

    await this.outboxRepository.createEvent({
      aggregateType: 'PaymentMethod',
      aggregateId: method.id,
      eventType,
      payload: {
        paymentMethodId: method.id,
        userId: method.userId,
        provider,
        providerMethodId,
        status
      }
    });
  }
}
