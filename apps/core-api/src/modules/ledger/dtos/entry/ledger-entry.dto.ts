import { z } from 'zod';
import { EntryType } from '@common/libs';

export const LedgerEntrySchema = z.object({
  accountId: z.string({ message: 'Account ID must be a string' }),

  entryType: z.enum(EntryType, { message: 'Entry type must be DEBIT or CREDIT' }),

  description: z.string({ message: 'Description must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  reference: z.string({ message: 'Reference must be a string' }).optional()
});

export type LedgerEntryDto = z.infer<typeof LedgerEntrySchema>;
