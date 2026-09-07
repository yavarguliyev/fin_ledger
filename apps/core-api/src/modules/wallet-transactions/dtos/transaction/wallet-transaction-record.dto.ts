import { z } from 'zod';
import { WalletTransactionStatus, WalletTransactionType } from '@common/libs';

export const WalletTransactionRecordSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  createdAt: z.string({ message: 'Created at must be a string' }),

  updatedAt: z.string({ message: 'Updated at must be a string' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  description: z.string({ message: 'Description must be a string' }),

  accountId: z.string({ message: 'Account ID must be a string' }),

  type: z.enum(WalletTransactionType, { message: 'Transaction type must be a valid wallet transaction type' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  currency: z.string({ message: 'Currency must be a string' }).optional(),

  status: z.enum(WalletTransactionStatus, { message: 'Status must be a valid wallet transaction status' }).optional(),

  conversionId: z.string({ message: 'Conversion ID must be a string' }).optional(),

  ledgerEntryId: z.string({ message: 'Ledger entry ID must be a string' }).optional(),

  transactionId: z.string({ message: 'Transaction ID must be a string' }).optional(),

  reference: z.string({ message: 'Reference must be a string' }).optional()
});

export type WalletTransactionRecordDto = z.infer<typeof WalletTransactionRecordSchema>;
