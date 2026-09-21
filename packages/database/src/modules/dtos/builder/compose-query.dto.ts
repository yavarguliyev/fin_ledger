import { z } from 'zod';

import type { JoinClause } from '../../interfaces/join-clause.interface';

export const ComposeQuerySchema = z.object({
  selection: z.string({ message: 'Selection must be a string' }),

  conditions: z.array(z.string()),

  joins: z.custom<JoinClause[]>(),

  trailing: z.string().optional()
});

export type ComposeQueryDto = z.infer<typeof ComposeQuerySchema>;
