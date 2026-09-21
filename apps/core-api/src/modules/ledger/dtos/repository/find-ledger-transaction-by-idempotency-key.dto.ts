import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const FindLedgerTransactionByIdempotencyKeySchema = z.object({
  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type FindLedgerTransactionByIdempotencyKeyDto = z.infer<typeof FindLedgerTransactionByIdempotencyKeySchema>;
