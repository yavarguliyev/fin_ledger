import { z } from 'zod';

import type { JoinClause } from '../../interfaces/join-clause.interface';
import { QueryOptionsSchema } from '../query/query-options.dto';

export const SelectQuerySchema = z.object({
  columns: z.array(z.string()),

  options: QueryOptionsSchema.optional(),

  joins: z.custom<JoinClause[]>().optional()
});

export type SelectQueryDto = z.infer<typeof SelectQuerySchema>;
