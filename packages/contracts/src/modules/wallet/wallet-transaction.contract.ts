import { z } from 'zod';

import { WALLET_TRANSACTION_STATUSES, WALLET_TRANSACTION_TYPES } from './wallet-values.contract';

export const WalletTransactionContractSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  type: z.enum(WALLET_TRANSACTION_TYPES, { message: 'Transaction type must be a valid wallet transaction type' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  currency: z.string({ message: 'Currency must be a string' }),

  status: z.enum(WALLET_TRANSACTION_STATUSES, { message: 'Status must be a valid wallet transaction status' }),

  reference: z.string({ message: 'Reference must be a string' }).nullable(),

  externalReference: z.string({ message: 'External reference must be a string' }).nullable(),

  balanceAfterMinor: z.number({ message: 'Balance after must be a number' }).int({ message: 'Balance after must be an integer' }).nullable(),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }).nullable(),

  ledgerTransactionId: z.string({ message: 'Ledger transaction ID must be a string' }).nullable(),

  createdAt: z.string({ message: 'Created at must be a string' })
});

export type WalletTransactionContract = z.infer<typeof WalletTransactionContractSchema>;
