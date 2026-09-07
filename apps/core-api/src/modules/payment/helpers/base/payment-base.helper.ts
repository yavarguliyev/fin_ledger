import { InternalServerErrorException } from '@nestjs/common';
import { DomainEventType, PaymentStatus, PaymentType } from '@common/libs';

import { PaymentStatusUpdateParamsDto } from '../../../notification/dtos/payment/payment-status-update-params.dto';
import { HandlePaymentOptionsDto } from '../../dtos/processing/handle-payment-options.dto';
import { PaymentUpdateDto } from '../../dtos/payment/payment-update.dto';
import { PaymentAnalyticsEventPayloadDto } from '../../dtos/analytics/payment-analytics-event.dto';
import { HandlePaymentResultDto } from '../../dtos/processing/handle-payment-result.dto';

export const buildEventPayload = (
  options: HandlePaymentOptionsDto,
  paymentType: PaymentType,
  failureReason: string
): PaymentAnalyticsEventPayloadDto => {
  const { paymentId, userId, walletId, input, status } = options;

  const isCompleted = status === PaymentStatus.COMPLETED;

  return {
    paymentId,
    userId,
    walletId: walletId,
    amountMinor: input.amountMinor,
    currency: input.currency,
    status,
    paymentType,
    timestamp: new Date().toISOString(),
    providerTransactionId: '',
    ...(!isCompleted && { failureReason })
  };
};

export const processPaymentStatusUpdate = async (params: PaymentStatusUpdateParamsDto): Promise<HandlePaymentResultDto> => {
  const { options, paymentRepository, outboxRepository, paymentType } = params;
  const { paymentId, status, failureReason: optFailureReason, tx } = options;

  const isCompleted = status === PaymentStatus.COMPLETED;
  const failureReason = optFailureReason ?? 'Payment processing failed';

  const updateData: PaymentUpdateDto = isCompleted
    ? {
        status: PaymentStatus.COMPLETED,
        transactionId: paymentId
      }
    : { status: PaymentStatus.FAILED, failureReason };

  const eventPayload = buildEventPayload(options, paymentType, failureReason);

  const updated = await paymentRepository.updatePaymentStatus(paymentId, updateData, tx);

  await outboxRepository.createEvent(
    {
      aggregateType: 'Payment',
      aggregateId: paymentId,
      eventType: isCompleted ? DomainEventType.PAYMENT_COMPLETED : DomainEventType.PAYMENT_FAILED,
      payload: eventPayload
    },
    tx
  );

  if (!updated) throw new InternalServerErrorException('Failed to update payment status');

  return { updated, eventPayload, isCompleted };
};
