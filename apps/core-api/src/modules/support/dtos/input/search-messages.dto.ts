import { z } from 'zod';

export const SearchMessagesSchema = z.object({
  conversationId: z.string(),
  actorId: z.string(),
  term: z.string()
});

export type SearchMessagesDto = z.infer<typeof SearchMessagesSchema>;
