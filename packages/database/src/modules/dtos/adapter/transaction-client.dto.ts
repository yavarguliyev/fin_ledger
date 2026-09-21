import { z } from 'zod';
import type { PoolClient } from 'pg';

export const TransactionClientSchema = z.object({
  client: z.custom<PoolClient>()
});

export type TransactionClientDto = z.infer<typeof TransactionClientSchema>;
