import { Inject, Injectable, Logger } from '@nestjs/common';
import { DomainEventType, PaymentStatus } from '@common/libs';

import { HandlePaymentChargeEventDto } from '../../dtos/input/handle-payment-charge-event.dto';
import { WebhookBaseUseCase } from '../base/webhook-base.use-case';
import { CompletePaymentUseCase } from '../../../payment/use-cases/commands/complete-payment.use-case';

@Injectable()
export class HandlePaymentChargeEventUseCase extends WebhookBaseUseCase<HandlePaymentChargeEventDto, void> {
  private readonly logger = new Logger(HandlePaymentChargeEventUseCase.name);

  @Inject(CompletePaymentUseCase)
  private readonly completePayment!: CompletePaymentUseCase;

  async execute ({ provider, payload, status }: HandlePaymentChargeEventDto): Promise<void> {
    const dataObj = (payload['data'] as Record<string, unknown>) ?? payload;
    const obj = (dataObj['object'] as Record<string, unknown>) ?? dataObj;
    const providerChargeId = (obj['id'] as string) || '';

    if (!providerChargeId) {
      return;
    }

    const payment = await this.paymentRepository.findByProviderChargeId({ provider, providerChargeId });
    if (!payment) {
      this.logger.warn(`Payment not found for provider charge ID: ${providerChargeId}`);
      return;
    }

    if (status === PaymentStatus.COMPLETED) {
      await this.completePayment.execute({ paymentId: payment.id, providerChargeId });
      return;
    }

    const updated = await this.paymentRepository.updatePaymentStatus({ paymentId: payment.id, status });
    if (!updated) {
      this.logger.warn(`Ignored ${status} for payment ${payment.id}: already ${payment.status}`);
      return;
    }

    if (status !== PaymentStatus.FAILED) return;

    await this.outboxRepository.createEvent({
      aggregateType: 'Payment',
      aggregateId: payment.id,
      eventType: DomainEventType.PAYMENT_FAILED,
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
