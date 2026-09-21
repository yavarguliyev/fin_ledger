import { z } from 'zod';
import { UnknownRecord } from '@common/shared-libs';

import type { Builder } from '../../postgres/query-builder/builder';

export const BuildSetClauseInputSchema = <T>(): z.ZodObject<{ builder: z.ZodCustom<Builder<T>>; data: z.ZodCustom<UnknownRecord> }> =>
  z.object({
    builder: z.custom<Builder<T>>(),

    data: z.custom<UnknownRecord>()
  });

export type BuildSetClauseInputDto<T> = z.infer<ReturnType<typeof BuildSetClauseInputSchema<T>>>;
