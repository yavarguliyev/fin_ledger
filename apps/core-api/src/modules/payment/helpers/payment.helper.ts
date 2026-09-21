import { BadRequestException } from '@nestjs/common';
import { DomainEventType, PaymentMethodStatus, PaymentStatus } from '@common/libs';

import { PublishPaymentEventsDto } from '../dtos/helper/publish-payment-events.dto';
import { ValidateAndGetPaymentMethodDto } from '../dtos/helper/validate-and-get-payment-method.dto';
import { PaymentMethodDto } from '../../payment-methods/dtos/payment-method/payment-method.dto';
import { AnalyticsHelper } from '../../analytics/helpers/analytics.helper';

export class PaymentHelper {
  public static async validateAndGetPaymentMethod (dto: ValidateAndGetPaymentMethodDto): Promise<PaymentMethodDto> {
    const { userId, paymentMethodId, paymentMethodRepository } = dto;
    if (!paymentMethodId) throw new BadRequestException('Payment method is required');

    const method = await paymentMethodRepository.findByIdAndUserId({ id: paymentMethodId, userId });
    if (!method) throw new BadRequestException('Payment method not found or does not belong to user');
    if (method.status !== PaymentMethodStatus.VERIFIED) throw new BadRequestException('Selected payment method is not verified');
    if (!method.providerMethodId) throw new BadRequestException('Payment method token is missing');

    return method;
  }
  public static async publishPaymentEvents (options: PublishPaymentEventsDto): Promise<void> {
    const { payment, walletId, dto, updated, paymentType, outboxRepository, publishPaymentCompleted, publishPaymentFailed } = options;

    const eventPayload = {
      paymentId: payment.id,
      userId: dto.userId,
      walletId,
      amountMinor: dto.amountMinor,
      currency: dto.currency,
      status: PaymentStatus.COMPLETED,
      paymentType,
      timestamp: new Date().toISOString(),
      providerTransactionId: updated.providerChargeId ?? ''
    };

    await outboxRepository.createEvent({
      aggregateType: 'Payment',
      aggregateId: payment.id,
      eventType: DomainEventType.PAYMENT_COMPLETED,
      payload: eventPayload
    });

    void AnalyticsHelper.emitKafkaPaymentAnalytics({ ...eventPayload, isCompleted: true, publishPaymentCompleted, publishPaymentFailed });
  }
}
