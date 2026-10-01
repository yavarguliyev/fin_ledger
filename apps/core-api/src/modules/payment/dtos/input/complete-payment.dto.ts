import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const CompletePaymentSchema = z.object({
  paymentId: z.string({ message: 'Payment ID must be a string' }),

  providerChargeId: z.string({ message: 'Provider charge ID must be a string' }).optional(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type CompletePaymentDto = z.infer<typeof CompletePaymentSchema>;
