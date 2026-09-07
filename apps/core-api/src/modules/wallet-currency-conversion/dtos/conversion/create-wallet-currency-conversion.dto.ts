import { z } from 'zod';
import { WalletTransactionStatus } from '@common/libs';

export const CreateWalletCurrencyConversionSchema = z.object({
  fxRateId: z.string({ message: 'FX rate ID must be a string' }),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }),

  status: z.enum(WalletTransactionStatus, { message: 'Status must be a valid wallet transaction status' }),

  rateProvider: z.string({ message: 'Rate provider must be a string' }),

  rate: z.string({ message: 'Rate must be a string' }),

  sourceAmountMinor: z.number({ message: 'Source amount must be a number' }),

  targetAmountMinor: z.number({ message: 'Target amount must be a number' }),

  feeAmountMinor: z.number({ message: 'Fee amount must be a number' }),

  sourceCurrency: z.string({ message: 'Source currency must be a string' }),

  targetCurrency: z.string({ message: 'Target currency must be a string' }),

  feeCurrency: z.string({ message: 'Fee currency must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  sourceWalletId: z.string({ message: 'Source wallet ID must be a string' }),

  targetWalletId: z.string({ message: 'Target wallet ID must be a string' }),

  sourceLedgerAccountId: z.string({ message: 'Source ledger account ID must be a string' }),

  targetLedgerAccountId: z.string({ message: 'Target ledger account ID must be a string' })
});

export type CreateWalletCurrencyConversionDto = z.infer<typeof CreateWalletCurrencyConversionSchema>;
