import { z } from 'zod';
import { WalletTransactionType } from '@common/libs';

export const EntrySchema = z.object({
  accountId: z.string({ message: 'Account ID must be a string' }).min(1, { message: 'Account ID is required' }),

  entryType: z
    .enum(Object.values(WalletTransactionType) as [string, ...string[]], {
      message: 'Entry type must be DEBIT or CREDIT'
    })
    .transform(val => val as WalletTransactionType),

  amountMinor: z
    .number({ message: 'Amount must be an integer (minor units)' })
    .int({ message: 'Amount must be an integer (minor units)' })
    .min(1, { message: 'Amount must be greater than 0' }),

  currency: z
    .string({ message: 'Currency must be a string' })
    .min(1, { message: 'Currency is required' })
    .length(3, { message: 'Currency must be a 3-character ISO code' }),

  description: z.string({ message: 'Description must be a string' }).min(1, { message: 'Description is required' }),

  reference: z
    .string({ message: 'Reference must be a string' })
    .optional()
    .transform(val => val ?? '')
});

export type EntryDto = z.infer<typeof EntrySchema>;
