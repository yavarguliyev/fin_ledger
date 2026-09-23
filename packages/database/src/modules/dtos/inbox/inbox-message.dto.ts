import { z } from 'zod';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const InboxMessageSchema = z.object({
  consumer: z.string({ message: 'Consumer must be a string' }),

  messageId: z.string({ message: 'Message ID must be a string' }),

  topic: z.string({ message: 'Topic must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type InboxMessageDto = z.infer<typeof InboxMessageSchema>;
