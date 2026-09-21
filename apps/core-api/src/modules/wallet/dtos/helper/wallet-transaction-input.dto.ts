import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { WalletSchema } from '../wallet/wallet.dto';

export const WalletTransactionInputSchema = z.object({
  wallet: WalletSchema,

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  transactionId: z.string({ message: 'Transaction ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional(),

  reference: z.string({ message: 'Reference must be a string' }).optional()
});

export type WalletTransactionInputDto = z.infer<typeof WalletTransactionInputSchema>;
