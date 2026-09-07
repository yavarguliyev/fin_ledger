import { BadRequestException } from '@nestjs/common';
import { PaymentMethodStatus } from '@common/libs';

import { RequestPaymentInput } from '../../dtos/request/request-payment.dto';

export const validatePaymentMethod = async ({ userId, dto, paymentMethodRepository }: RequestPaymentInput): Promise<void> => {
  if (!dto.paymentMethodId) throw new BadRequestException('Payment method is required');

  const method = await paymentMethodRepository.findById(dto.paymentMethodId);
  if (!method || method.userId !== userId) throw new BadRequestException('Payment method not found');
  if (method.status !== PaymentMethodStatus.VERIFIED) throw new BadRequestException('Selected payment method is not verified');
};
