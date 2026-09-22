import { z } from 'zod';

export const FindChargePaymentSchema = z.object({
  provider: z.string(),

  providerChargeId: z.string(),

  paymentId: z.string().nullable()
});

export type FindChargePaymentDto = z.infer<typeof FindChargePaymentSchema>;
