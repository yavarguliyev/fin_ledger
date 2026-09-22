import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { WalletOperationSchema } from './wallet-operation.dto';

export const WalletOperationInTransactionSchema = WalletOperationSchema.extend({
  adapter: z.custom<DatabaseAdapter>()
});

export type WalletOperationInTransactionDto = z.infer<typeof WalletOperationInTransactionSchema>;
