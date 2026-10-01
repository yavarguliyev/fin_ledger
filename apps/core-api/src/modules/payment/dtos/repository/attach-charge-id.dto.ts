import { z } from 'zod';

export const AttachChargeIdSchema = z.object({
  paymentId: z.string({ message: 'Payment ID must be a string' }),

  providerChargeId: z.string({ message: 'Provider charge ID must be a string' })
});

export type AttachChargeIdDto = z.infer<typeof AttachChargeIdSchema>;
