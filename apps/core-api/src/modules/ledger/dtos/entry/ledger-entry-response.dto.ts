import { z } from 'zod';
import { WalletTransactionType } from '@common/libs';

export const LedgerEntryResponseSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  createdAt: z.string({ message: 'Created at must be a string' }),

  sequence: z.number({ message: 'Sequence must be a number' }).int({ message: 'Sequence must be an integer' }),

  transactionId: z.string({ message: 'Transaction ID must be a string' }).optional(),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  accountId: z.string({ message: 'Account ID must be a string' }),

  description: z.string({ message: 'Description must be a string' }),

  entryType: z.enum(WalletTransactionType, { message: 'Entry type must be a valid wallet transaction type' }),

  reference: z.string({ message: 'Reference must be a string' }).optional()
});

export type LedgerEntryResponseDto = z.infer<typeof LedgerEntryResponseSchema>;
