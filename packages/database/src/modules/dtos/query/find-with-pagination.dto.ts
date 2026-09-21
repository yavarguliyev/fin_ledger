import { z } from 'zod';

import { QueryWithAdapterSchema } from './query-with-adapter.dto';

export const FindWithPaginationSchema = QueryWithAdapterSchema.extend({
  page: z.number().int().positive(),

  limit: z.number().int().positive()
});

export type FindWithPaginationDto = z.infer<typeof FindWithPaginationSchema>;
