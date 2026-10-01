import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const FindChargePaymentSchema = z.object({
  provider: z.string(),

  providerChargeId: z.string(),

  paymentId: z.string().nullable(),

  adapter: z.custom<DatabaseAdapter>()
});

export type FindChargePaymentDto = z.infer<typeof FindChargePaymentSchema>;
