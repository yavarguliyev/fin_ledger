import { z } from 'zod';

import type { Builder } from '../../postgres/query-builder/builder';

export const UpdatedAtClauseSchema = <T>(): z.ZodObject<{ builder: z.ZodCustom<Builder<T>> }> =>
  z.object({
    builder: z.custom<Builder<T>>()
  });

export type UpdatedAtClauseDto<T> = z.infer<ReturnType<typeof UpdatedAtClauseSchema<T>>>;
