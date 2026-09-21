import { z } from 'zod';

import type { JoinClause } from '../../interfaces/join-clause.interface';
import { QueryOptionsSchema } from '../query/query-options.dto';

export const AggregateQuerySchema = z.object({
  options: QueryOptionsSchema.optional(),

  joins: z.custom<JoinClause[]>().optional()
});

export type AggregateQueryDto = z.infer<typeof AggregateQuerySchema>;
