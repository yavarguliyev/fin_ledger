import { z } from 'zod';
import { DatabaseAdapter, WalletTransactionType } from '@common/libs';

import { CreditDebitSchema } from '../balance-operation/credit-debit.dto';

export const WalletOperationSchema = CreditDebitSchema.extend({
  walletId: z.string({ message: 'Wallet ID must be a string' }).min(1, { message: 'Wallet ID is required' }),

  transactionType: z.enum(WalletTransactionType, { message: 'Transaction type must be a valid wallet transaction type' }).optional(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type WalletOperationDto = z.infer<typeof WalletOperationSchema>;
