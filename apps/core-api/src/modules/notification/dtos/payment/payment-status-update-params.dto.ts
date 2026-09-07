import { z } from 'zod';
import { OutboxRepository, PaymentType } from '@common/libs';

import { PaymentRepository } from '../../../payment/repositories/payment.repository';
import { HandlePaymentOptionsDto, HandlePaymentOptionsSchema } from '../../../payment/dtos/processing/handle-payment-options.dto';

export const PaymentStatusUpdateParamsSchema = z.object({
  options: HandlePaymentOptionsSchema,

  paymentType: z.enum(PaymentType, { message: 'Payment type must be a valid payment type' })
});

export type PaymentStatusUpdateParamsDto = z.infer<typeof PaymentStatusUpdateParamsSchema> & {
  options: HandlePaymentOptionsDto;
  paymentRepository: PaymentRepository;
  outboxRepository: OutboxRepository;
};
