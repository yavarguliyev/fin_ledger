import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { AmountMinorSchema } from '../balance/amount-minor.dto';

export const FundsOperationSchema = AmountMinorSchema.extend({
  walletId: z.string({ message: 'Wallet ID must be a string' }).min(1, { message: 'Wallet ID is required' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type FundsOperationDto = z.infer<typeof FundsOperationSchema>;
