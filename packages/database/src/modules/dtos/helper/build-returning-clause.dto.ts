import { z } from 'zod';

import type { Builder } from '../../postgres/query-builder/builder';

export const BuildReturningClauseSchema = <T>(): z.ZodObject<{ builder: z.ZodCustom<Builder<T>>; selectColumns: z.ZodArray<z.ZodString> }> =>
  z.object({
    builder: z.custom<Builder<T>>(),

    selectColumns: z.array(z.string())
  });

export type BuildReturningClauseDto<T> = z.infer<ReturnType<typeof BuildReturningClauseSchema<T>>>;
