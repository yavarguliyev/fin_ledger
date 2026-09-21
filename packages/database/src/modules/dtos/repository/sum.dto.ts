import { z } from 'zod';

import { QueryWithAdapterSchema } from '../query/query-with-adapter.dto';

export const SumSchema = QueryWithAdapterSchema.extend({
  column: z.string({ message: 'Column must be a string' })
});

export type SumDto = z.infer<typeof SumSchema>;
