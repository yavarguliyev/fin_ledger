import { z } from 'zod';
import { ProviderChargeResultDto } from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';

export const MarkIndeterminateSchema = z.object({
  paymentRepository: z.custom<PaymentRepository>(),

  paymentId: z.string({ message: 'Payment ID must be a string' }),

  charge: z.custom<ProviderChargeResultDto>()
});

export type MarkIndeterminateDto = z.infer<typeof MarkIndeterminateSchema>;
