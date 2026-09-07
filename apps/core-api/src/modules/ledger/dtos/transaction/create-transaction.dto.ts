import { z } from 'zod';

import { EntrySchema } from '../entry/entry.dto';

export const CreateLedgerTransactionSchema = z.object({
  entries: z.array(EntrySchema, { message: 'Entries must be an array' }).min(1, { message: 'Entries cannot be empty' })
});

export type CreateLedgerTransactionDto = z.infer<typeof CreateLedgerTransactionSchema>;
