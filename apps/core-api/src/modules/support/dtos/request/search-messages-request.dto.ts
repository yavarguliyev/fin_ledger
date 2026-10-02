import { z } from 'zod';

import { MESSAGE_SEARCH } from '../../constants/chat/message-search.constant';

export const SearchMessagesRequestSchema = z.object({
  id: z.string({ message: 'ID must be a string' }).min(1, { message: 'ID is required' }),

  q: z
    .string({ message: 'Search text must be a string' })
    .trim()
    .min(MESSAGE_SEARCH.MIN_LENGTH, { message: 'Search text is too short' })
    .max(MESSAGE_SEARCH.MAX_LENGTH, { message: 'Search text is too long' })
});

export type SearchMessagesRequestDto = z.infer<typeof SearchMessagesRequestSchema>;
