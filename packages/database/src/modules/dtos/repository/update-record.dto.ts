import { z } from 'zod';
import { EntityId } from '@common/shared-libs';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const UpdateRecordSchema = <T, K extends keyof T = keyof T>(): z.ZodObject<{ id: z.ZodCustom<EntityId>; data: z.ZodCustom<Partial<T>>; returningColumns: z.ZodOptional<z.ZodCustom<K[]>>; adapter: z.ZodOptional<z.ZodCustom<DatabaseAdapter>> }> =>
  z.object({
    id: z.custom<EntityId>(),

    data: z.custom<Partial<T>>(),

    returningColumns: z.custom<K[]>().optional(),

    adapter: z.custom<DatabaseAdapter>().optional()
  });

export type UpdateRecordDto<T, K extends keyof T = keyof T> = z.infer<ReturnType<typeof UpdateRecordSchema<T, K>>>;
