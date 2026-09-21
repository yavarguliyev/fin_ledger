import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { FundsOperationSchema } from '../input/funds-operation.dto';

export const FundsTransactionSchema = FundsOperationSchema.extend({
  adapter: z.custom<DatabaseAdapter>()
});

export type FundsTransactionDto = z.infer<typeof FundsTransactionSchema>;
