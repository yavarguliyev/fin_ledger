import { z } from 'zod';

import { AggregateQuerySchema } from './aggregate-query.dto';

export const SumQuerySchema = AggregateQuerySchema.extend({
  column: z.string({ message: 'Column must be a string' })
});

export type SumQueryDto = z.infer<typeof SumQuerySchema>;
