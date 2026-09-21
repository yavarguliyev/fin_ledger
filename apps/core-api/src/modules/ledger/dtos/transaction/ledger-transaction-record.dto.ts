import { z } from 'zod';

import { LedgerTransactionSchema } from './ledger-transaction.dto';

export const LedgerTransactionRecordSchema = LedgerTransactionSchema.extend({
  id: z.string({ message: 'ID must be a string' }),

  effectiveAt: z.string({ message: 'Effective at must be a string' }),

  createdAt: z.string({ message: 'Created at must be a string' })
});

export type LedgerTransactionRecordDto = z.infer<typeof LedgerTransactionRecordSchema>;
