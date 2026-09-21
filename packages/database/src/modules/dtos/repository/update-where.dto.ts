import { z } from 'zod';
import { UnknownRecord } from '@common/shared-libs';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const UpdateWhereSchema = <T>(): z.ZodObject<{ where: z.ZodCustom<UnknownRecord>; data: z.ZodCustom<Partial<T>>; adapter: z.ZodOptional<z.ZodCustom<DatabaseAdapter>> }> =>
  z.object({
    where: z.custom<UnknownRecord>(),

    data: z.custom<Partial<T>>(),

    adapter: z.custom<DatabaseAdapter>().optional()
  });

export type UpdateWhereDto<T> = z.infer<ReturnType<typeof UpdateWhereSchema<T>>>;
