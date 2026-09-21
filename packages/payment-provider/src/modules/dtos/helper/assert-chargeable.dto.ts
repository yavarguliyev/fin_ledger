import { z } from 'zod';

export const AssertChargeableSchema = z.object({
  amountMinor: z.number({ message: 'Amount must be a number' }).int(),

  currency: z.string({ message: 'Currency must be a string' })
});

export type AssertChargeableDto = z.infer<typeof AssertChargeableSchema>;
