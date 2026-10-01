import { z } from 'zod';

export const ReadConversationSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1, { message: 'Conversation ID is required' }),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  role: z.string({ message: 'Role must be a string' })
});

export type ReadConversationDto = z.infer<typeof ReadConversationSchema>;
