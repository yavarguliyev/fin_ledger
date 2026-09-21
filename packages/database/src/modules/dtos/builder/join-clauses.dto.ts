import { z } from 'zod';

import type { JoinClause } from '../../interfaces/join-clause.interface';

export const JoinClausesSchema = z.object({
  joins: z.custom<JoinClause[]>()
});

export type JoinClausesDto = z.infer<typeof JoinClausesSchema>;
