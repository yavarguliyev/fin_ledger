import { z } from 'zod';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const RescheduleFailedEventSchema = z.object({
  id: z.string({ message: 'Event ID must be a string' }),

  attempts: z.number({ message: 'Attempts must be a number' }).int().nonnegative(),

  lastError: z.string({ message: 'Last error must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type RescheduleFailedEventDto = z.infer<typeof RescheduleFailedEventSchema>;
