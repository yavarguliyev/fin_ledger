import { z } from 'zod';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const OutboxEventIdSchema = z.object({
  id: z.string({ message: 'Event ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type OutboxEventIdDto = z.infer<typeof OutboxEventIdSchema>;
