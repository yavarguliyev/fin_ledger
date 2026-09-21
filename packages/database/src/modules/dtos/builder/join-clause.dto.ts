import { z } from 'zod';

import type { JoinClause } from '../../interfaces/join-clause.interface';

export const JoinClauseRefSchema = z.object({
  join: z.custom<JoinClause>()
});

export type JoinClauseRefDto = z.infer<typeof JoinClauseRefSchema>;
