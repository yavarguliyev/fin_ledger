import { z } from 'zod';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const TransactionWithRetrySchema = <R>(): z.ZodObject<{ callback: z.ZodCustom<(adapter: DatabaseAdapter) => Promise<R>>; retries: z.ZodOptional<z.ZodNumber> }> =>
  z.object({
    callback: z.custom<(adapter: DatabaseAdapter) => Promise<R>>(),

    retries: z.number().int().positive().optional()
  });

export type TransactionWithRetryDto<R> = z.infer<ReturnType<typeof TransactionWithRetrySchema<R>>>;
