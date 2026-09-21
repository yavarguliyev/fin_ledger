import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { LedgerTransactionSchema } from '../transaction/ledger-transaction.dto';

export const CreateLedgerTransactionRecordSchema = LedgerTransactionSchema.extend({
  adapter: z.custom<DatabaseAdapter>().optional()
});

export type CreateLedgerTransactionRecordDto = z.infer<typeof CreateLedgerTransactionRecordSchema>;
