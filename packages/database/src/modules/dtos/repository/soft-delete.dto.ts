import { z } from 'zod';
import { EntityId } from '@common/shared-libs';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const SoftDeleteSchema = <T>(): z.ZodObject<{ id: z.ZodCustom<EntityId>; data: z.ZodCustom<Partial<T>>; adapter: z.ZodOptional<z.ZodCustom<DatabaseAdapter>> }> =>
  z.object({
    id: z.custom<EntityId>(),

    data: z.custom<Partial<T>>(),

    adapter: z.custom<DatabaseAdapter>().optional()
  });

export type SoftDeleteDto<T> = z.infer<ReturnType<typeof SoftDeleteSchema<T>>>;
