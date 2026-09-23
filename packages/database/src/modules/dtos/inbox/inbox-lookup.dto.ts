import { z } from 'zod';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const InboxLookupSchema = z.object({
  consumer: z.string({ message: 'Consumer must be a string' }),

  messageId: z.string({ message: 'Message ID must be a string' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type InboxLookupDto = z.infer<typeof InboxLookupSchema>;
