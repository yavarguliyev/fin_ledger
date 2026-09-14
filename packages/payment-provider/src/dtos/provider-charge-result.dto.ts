import { z } from 'zod';
import { ProviderChargeStatus } from '@common/shared-libs';

export const ProviderChargeResultSchema = z.object({
  chargeId: z.string({ message: 'Charge ID must be a string' }),

  status: z.enum(ProviderChargeStatus),

  amount: z.number().int().nonnegative({ message: 'Amount must be a non-negative integer' }),

  currency: z.string({ message: 'Currency must be a string' }),

  rawResponse: z.record(z.string(), z.unknown()).optional(),

  failureReason: z.string().optional()
});

export type ProviderChargeResultDto = z.infer<typeof ProviderChargeResultSchema>;
