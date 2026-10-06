import { z } from 'zod';

export const PaymentFailedV1Schema = z.object({
  paymentId: z.string({ message: 'Payment ID must be a string' }).min(1),

  userId: z.string({ message: 'User ID must be a string' }).min(1),

  amountMinor: z.number({ message: 'Amount must be a number' }).int(),

  currency: z.string({ message: 'Currency must be a string' }).min(1),

  status: z.string({ message: 'Status must be a string' }).min(1),

  provider: z.string({ message: 'Provider must be a string' }).nullish(),

  providerChargeId: z.string({ message: 'Provider charge ID must be a string' }).nullish()
});

export type PaymentFailedV1 = z.infer<typeof PaymentFailedV1Schema>;
