import { Injectable, Logger } from '@nestjs/common';
import { DomainEventType, PaymentMethodStatus } from '@common/libs';

import { HandlePaymentMethodEventDto } from '../../dtos/input/handle-payment-method-event.dto';
import { WebhookBaseUseCase } from '../base/webhook-base.use-case';

@Injectable()
export class HandlePaymentMethodEventUseCase extends WebhookBaseUseCase<HandlePaymentMethodEventDto, void> {
  private readonly logger = new Logger(HandlePaymentMethodEventUseCase.name);

  async execute ({ provider, payload, status, adapter }: HandlePaymentMethodEventDto): Promise<void> {
    const dataObj = (payload['data'] as Record<string, unknown>) ?? payload;
    const obj = (dataObj['object'] as Record<string, unknown>) ?? dataObj;
    const providerMethodId = (obj['id'] as string) || (obj['payment_method'] as string);

    if (!providerMethodId) return;

    const method = await this.paymentMethodRepository.findByProviderMethodId({ provider, providerMethodId, adapter });
    if (!method) {
      this.logger.warn(`Payment method not found for provider method ID: ${providerMethodId}`);
      return;
    }

    await this.paymentMethodRepository.updateStatus({ id: method.id, status, adapter });
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
      },
      adapter
    });
  }
}
