import { z } from 'zod';
import { EntityId } from '@common/shared-libs';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const IncrementSchema = <T>(): z.ZodObject<{ id: z.ZodCustom<EntityId>; field: z.ZodCustom<keyof T & string>; amount: z.ZodNumber; adapter: z.ZodOptional<z.ZodCustom<DatabaseAdapter>> }> =>
  z.object({
    id: z.custom<EntityId>(),

    field: z.custom<keyof T & string>(),

    amount: z.number({ message: 'Amount must be a number' }),

    adapter: z.custom<DatabaseAdapter>().optional()
  });

export type IncrementDto<T> = z.infer<ReturnType<typeof IncrementSchema<T>>>;
