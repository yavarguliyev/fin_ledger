import { z } from 'zod';
import { DatabaseAdapter, WalletTransactionStatus, WalletTransactionType } from '@common/libs';

export const CreateWalletTransactionSchema = z.object({
  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  type: z.enum(WalletTransactionType, { message: 'Transaction type must be a valid wallet transaction type' }),

  status: z.enum(WalletTransactionStatus, { message: 'Status must be a valid wallet transaction status' }).optional(),

  ledgerTransactionId: z.string({ message: 'Ledger transaction ID must be a string' }).optional(),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }).optional(),

  balanceAfterMinor: z.number({ message: 'Balance after must be a number' }).int({ message: 'Balance after must be an integer' }).optional(),

  externalReference: z.string({ message: 'External reference must be a string' }).optional(),

  reference: z.string({ message: 'Reference must be a string' }).optional(),

  adapter: z.custom<DatabaseAdapter>()
});

export type CreateWalletTransactionDto = z.infer<typeof CreateWalletTransactionSchema>;
