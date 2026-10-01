import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const FailPaymentSchema = z.object({
  paymentId: z.string({ message: 'Payment ID must be a string' }),

  failureReason: z.string({ message: 'Failure reason must be a string' }).optional(),

  failureCode: z.string({ message: 'Failure code must be a string' }).optional(),

  providerChargeId: z.string({ message: 'Provider charge ID must be a string' }).optional(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type FailPaymentDto = z.infer<typeof FailPaymentSchema>;
