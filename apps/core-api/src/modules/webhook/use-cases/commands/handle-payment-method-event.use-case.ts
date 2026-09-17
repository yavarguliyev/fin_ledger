import { Injectable, Logger } from '@nestjs/common';
import { DomainEventType, PaymentMethodStatus, OutboxRepository } from '@common/libs';

import { HandlePaymentMethodEventInput } from '../../dtos/request/handle-webhook.dto';
import { WebhookBaseUseCase } from '../base/webhook-base.use-case';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';

@Injectable()
export class HandlePaymentMethodEventUseCase extends WebhookBaseUseCase<HandlePaymentMethodEventInput, void> {
  private readonly logger = new Logger(HandlePaymentMethodEventUseCase.name);

  constructor (
    private readonly outboxRepository: OutboxRepository,
    private readonly paymentMethodRepository: PaymentMethodRepository
  ) {
    super();
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
    await this.outboxRepository.createEvent({
      aggregateType: 'PaymentMethod',
      aggregateId: method.id,
      eventType: status === PaymentMethodStatus.VERIFIED ? DomainEventType.PAYMENT_METHOD_VERIFIED : DomainEventType.PAYMENT_METHOD_REJECTED,
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
