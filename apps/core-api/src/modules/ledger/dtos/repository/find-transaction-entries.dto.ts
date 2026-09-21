import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const FindTransactionEntriesSchema = z.object({
  transactionId: z.string({ message: 'Transaction ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type FindTransactionEntriesDto = z.infer<typeof FindTransactionEntriesSchema>;
