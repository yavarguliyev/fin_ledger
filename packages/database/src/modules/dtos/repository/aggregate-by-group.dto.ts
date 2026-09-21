import { z } from 'zod';

import type { AggregateSpec } from '../../interfaces/aggregate-spec.interface';
import { QueryWithAdapterSchema } from '../query/query-with-adapter.dto';

export const AggregateByGroupSchema = QueryWithAdapterSchema.extend({
  groupBy: z.string({ message: 'Group by must be a string' }),

  aggregates: z.custom<AggregateSpec[]>()
});

export type AggregateByGroupDto = z.infer<typeof AggregateByGroupSchema>;
