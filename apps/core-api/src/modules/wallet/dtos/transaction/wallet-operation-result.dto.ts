import { z } from 'zod';

import { WalletSchema } from '../wallet/wallet.dto';

export const WalletOperationResultSchema = z.object({
  wallet: WalletSchema,

  ledgerTransactionId: z.string({ message: 'Ledger transaction ID must be a string' })
});

export type WalletOperationResultDto = z.infer<typeof WalletOperationResultSchema>;
