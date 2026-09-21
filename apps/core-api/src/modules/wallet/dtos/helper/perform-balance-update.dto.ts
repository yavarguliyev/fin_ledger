import { z } from 'zod';
import { DatabaseAdapter, EntryType } from '@common/libs';

import { WalletSchema } from '../wallet/wallet.dto';
import { WalletRepository } from '../../repositories/wallet.repository';

export const PerformBalanceUpdateSchema = z.object({
  wallet: WalletSchema,

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  adapter: z.custom<DatabaseAdapter>(),

  balanceWalletTransactionType: z.enum(EntryType, { message: 'Entry type must be DEBIT or CREDIT' }),

  walletRepository: z.custom<WalletRepository>()
});

export type PerformBalanceUpdateDto = z.infer<typeof PerformBalanceUpdateSchema>;
