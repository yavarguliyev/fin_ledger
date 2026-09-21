import { z } from 'zod';
import { EntityId } from '@common/shared-libs';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const UpdateWithVersionSchema = <T>(): z.ZodObject<{ id: z.ZodCustom<EntityId>; data: z.ZodCustom<Partial<T>>; versionField: z.ZodCustom<keyof T & string>; expectedVersion: z.ZodNumber; adapter: z.ZodOptional<z.ZodCustom<DatabaseAdapter>> }> =>
  z.object({
    id: z.custom<EntityId>(),

    data: z.custom<Partial<T>>(),

    versionField: z.custom<keyof T & string>(),

    expectedVersion: z.number({ message: 'Expected version must be a number' }),

    adapter: z.custom<DatabaseAdapter>().optional()
  });

export type UpdateWithVersionDto<T> = z.infer<ReturnType<typeof UpdateWithVersionSchema<T>>>;
