import { z } from 'zod';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const NextAggregateVersionSchema = z.object({
  aggregateType: z.string({ message: 'Aggregate type must be a string' }),

  aggregateId: z.string({ message: 'Aggregate ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type NextAggregateVersionDto = z.infer<typeof NextAggregateVersionSchema>;
