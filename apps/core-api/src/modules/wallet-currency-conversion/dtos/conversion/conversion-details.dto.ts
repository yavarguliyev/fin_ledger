import { z } from 'zod';

export const ConversionDetailsSchema = z.object({
  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  descriptionPrefix: z.string({ message: 'Description prefix must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' })
});

export type ConversionDetailsDto = z.infer<typeof ConversionDetailsSchema>;
