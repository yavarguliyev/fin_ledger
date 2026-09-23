import { z } from 'zod';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const TransactionSchema = <R>(): z.ZodObject<{
  callback: z.ZodCustom<(adapter: DatabaseAdapter) => Promise<R>>;
  actor: z.ZodOptional<z.ZodString>;
}> =>
  z.object({
    callback: z.custom<(adapter: DatabaseAdapter) => Promise<R>>(),

    actor: z.string().optional()
  });

export type TransactionDto<R> = z.infer<ReturnType<typeof TransactionSchema<R>>>;
