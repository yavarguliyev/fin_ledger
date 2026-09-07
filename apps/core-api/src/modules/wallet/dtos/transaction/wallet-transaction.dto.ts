import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { WalletSchema } from '../wallet/wallet.dto';

export const WalletTransactionSchema = z.object({
  wallet: WalletSchema,

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  conversionId: z.string({ message: 'Conversion ID must be a string' }).optional(),

  ledgerEntryId: z.string({ message: 'Ledger entry ID must be a string' }).optional(),

  transactionId: z.string({ message: 'Transaction ID must be a string' }).optional(),

  reference: z.string({ message: 'Reference must be a string' }).optional()
});

export type WalletTransactionDto = z.infer<typeof WalletTransactionSchema> & { adapter?: DatabaseAdapter };
