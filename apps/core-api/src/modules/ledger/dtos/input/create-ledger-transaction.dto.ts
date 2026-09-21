import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { LedgerEntrySchema } from '../entry/ledger-entry.dto';
import { LedgerTransactionSchema } from '../transaction/ledger-transaction.dto';

export const CreateLedgerTransactionSchema = z.object({
  entries: z.array(LedgerEntrySchema),

  transaction: LedgerTransactionSchema,

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type CreateLedgerTransactionDto = z.infer<typeof CreateLedgerTransactionSchema>;
