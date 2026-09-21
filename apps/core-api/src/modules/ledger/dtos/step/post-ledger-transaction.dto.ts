import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { CreateLedgerTransactionSchema } from '../input/create-ledger-transaction.dto';

export const PostLedgerTransactionSchema = CreateLedgerTransactionSchema.extend({
  adapter: z.custom<DatabaseAdapter>()
});

export type PostLedgerTransactionDto = z.infer<typeof PostLedgerTransactionSchema>;
