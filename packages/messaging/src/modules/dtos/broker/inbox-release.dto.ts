import { z } from 'zod';
import type { InboxRepository } from '@common/database';

export const InboxReleaseSchema = z.object({
  queue: z.string({ message: 'Queue must be a string' }),

  eventId: z.string({ message: 'Event ID must be a string' }),

  inbox: z.custom<InboxRepository>()
});

export type InboxReleaseDto = z.infer<typeof InboxReleaseSchema>;
