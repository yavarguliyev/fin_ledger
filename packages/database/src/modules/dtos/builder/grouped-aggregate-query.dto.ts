import { z } from 'zod';

import type { AggregateSpec } from '../../interfaces/aggregate-spec.interface';
import { AggregateQuerySchema } from './aggregate-query.dto';

export const GroupedAggregateQuerySchema = AggregateQuerySchema.extend({
  groupBy: z.string({ message: 'Group by must be a string' }),

  aggregates: z.custom<AggregateSpec[]>()
});

export type GroupedAggregateQueryDto = z.infer<typeof GroupedAggregateQuerySchema>;
