import { z } from 'zod';

export const FormatAmountSchema = z.object({
  amountMinor: z.number({ message: 'amountMinor must be a number' }),

  currency: z.string({ message: 'Currency must be a string' })
});

export type FormatAmountDto = z.infer<typeof FormatAmountSchema>;
