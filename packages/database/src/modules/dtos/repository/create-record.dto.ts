import { z } from 'zod';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const CreateRecordSchema = <T, K extends keyof T = keyof T>(): z.ZodObject<{ data: z.ZodCustom<Partial<T>>; returningColumns: z.ZodOptional<z.ZodCustom<K[]>>; adapter: z.ZodOptional<z.ZodCustom<DatabaseAdapter>> }> =>
  z.object({
    data: z.custom<Partial<T>>(),

    returningColumns: z.custom<K[]>().optional(),

    adapter: z.custom<DatabaseAdapter>().optional()
  });

export type CreateRecordDto<T, K extends keyof T = keyof T> = z.infer<ReturnType<typeof CreateRecordSchema<T, K>>>;
