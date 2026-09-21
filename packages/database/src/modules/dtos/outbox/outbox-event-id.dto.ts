import { z } from 'zod';

export const OutboxEventIdSchema = z.object({
  id: z.string({ message: 'Event ID must be a string' })
});

export type OutboxEventIdDto = z.infer<typeof OutboxEventIdSchema>;
