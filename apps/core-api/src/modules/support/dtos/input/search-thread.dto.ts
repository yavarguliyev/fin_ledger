import { z } from 'zod';

import { SearchMessagesRequestSchema } from '../request/search-messages-request.dto';

export const SearchThreadSchema = SearchMessagesRequestSchema.extend({
  actorId: z.string({ message: 'Actor ID must be a string' }).min(1, { message: 'Actor ID is required' }),

  role: z.string({ message: 'Role must be a string' })
});

export type SearchThreadDto = z.infer<typeof SearchThreadSchema>;
