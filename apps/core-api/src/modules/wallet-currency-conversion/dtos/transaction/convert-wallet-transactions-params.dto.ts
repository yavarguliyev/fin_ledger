import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

export const ConvertWalletTransactionsParamsSchema = z.object({
  walletId: z.string({ message: 'Wallet ID must be a string' }),

  rate: z.string({ message: 'Rate must be a string' }),

  targetCurrency: z.string({ message: 'Target currency must be a string' }),

  walletTransactionRepository: z.custom<WalletTransactionRepository>()
});

export type ConvertWalletTransactionsParamsDto = z.infer<typeof ConvertWalletTransactionsParamsSchema> & {
  tx: DatabaseAdapter;
  walletTransactionRepository: WalletTransactionRepository;
};
