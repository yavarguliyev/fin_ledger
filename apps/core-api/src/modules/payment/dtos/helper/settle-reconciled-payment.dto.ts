import { z } from 'zod';
import { ProviderChargeResultDto } from '@common/libs';

import { PaymentSchema } from '../payment/payment.dto';

export const SettleReconciledPaymentSchema = z.object({
  payment: PaymentSchema,

  charge: z.custom<ProviderChargeResultDto>()
});

export type SettleReconciledPaymentDto = z.infer<typeof SettleReconciledPaymentSchema>;
