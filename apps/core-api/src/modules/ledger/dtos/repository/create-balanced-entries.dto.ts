import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { LedgerEntrySchema } from '../entry/ledger-entry.dto';

export const CreateBalancedEntriesSchema = z.object({
  entries: z.array(LedgerEntrySchema),

  transactionId: z.string({ message: 'Transaction ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type CreateBalancedEntriesDto = z.infer<typeof CreateBalancedEntriesSchema>;
