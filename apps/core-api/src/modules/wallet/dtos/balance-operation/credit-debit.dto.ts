import { z } from 'zod';

import { AmountMinorSchema } from '../balance/amount-minor.dto';

export const CreditDebitSchema = AmountMinorSchema.extend({
  currency: z
    .string({ message: 'Currency must be a string' })
    .min(1, { message: 'Currency is required' })
    .length(3, { message: 'Currency must be a 3-character ISO code' }),

  transactionId: z.string({ message: 'Transaction ID must be a string' }).min(1, { message: 'Transaction ID is required' }),

  reference: z
    .string({ message: 'Reference must be a string' })
    .optional()
    .transform(val => val ?? '')
});

export type CreditDebitDto = z.infer<typeof CreditDebitSchema>;
