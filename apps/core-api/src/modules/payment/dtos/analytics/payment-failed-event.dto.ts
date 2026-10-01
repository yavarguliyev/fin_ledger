import { z } from 'zod';
import { PaymentStatus } from '@common/libs';

export const PaymentFailedEventPayloadSchema = z.object({
  paymentId: z.string(),

  userId: z.string(),

  amountMinor: z.number().int(),

  currency: z.string(),

  status: z.enum(PaymentStatus),

  provider: z.string().optional(),

  providerChargeId: z.string().nullable().optional()
});

export type PaymentFailedEventPayloadDto = z.infer<typeof PaymentFailedEventPayloadSchema>;
