import { z } from 'zod';

export const RecordGameEventResultSchema = z.object({
  eventId: z.uuid({ message: 'Event ID must be a valid UUID' }),

  result: z.string({ message: 'Result must be a string' }).min(1, { message: 'Result is required' })
});

export type RecordGameEventResultDto = z.infer<typeof RecordGameEventResultSchema>;
