import { BadRequestException } from '@nestjs/common';
import { PaymentMethodStatus, PaymentStatus } from '@common/libs';

import { PaymentRefDto } from '../dtos/helper/payment-ref.dto';
import { PaymentAnalyticsEventPayloadDto } from '../dtos/analytics/payment-analytics-event.dto';
import { PaymentFailedEventPayloadDto } from '../dtos/analytics/payment-failed-event.dto';
import { ValidateAndGetPaymentMethodDto } from '../dtos/helper/validate-and-get-payment-method.dto';
import { PaymentMethodDto } from '../../payment-methods/dtos/payment-method/payment-method.dto';

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

  public static completedEventPayload ({ payment }: PaymentRefDto): PaymentAnalyticsEventPayloadDto {
    return {
      paymentId: payment.id,
      userId: payment.userId,
      walletId: payment.walletId,
      amountMinor: payment.amountMinor,
      currency: payment.currency,
      status: PaymentStatus.COMPLETED,
      paymentType: payment.type,
      timestamp: new Date().toISOString(),
      providerTransactionId: payment.providerChargeId ?? ''
    };
  }

  public static failedEventPayload ({ payment }: PaymentRefDto): PaymentFailedEventPayloadDto {
    return {
      paymentId: payment.id,
      userId: payment.userId,
      amountMinor: payment.amountMinor,
      currency: payment.currency,
      status: PaymentStatus.FAILED,
      provider: payment.provider,
      providerChargeId: payment.providerChargeId
    };
  }

}
