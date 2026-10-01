import { z } from 'zod';

export const ConversationRefSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1, { message: 'Conversation ID is required' })
});

export type ConversationRefDto = z.infer<typeof ConversationRefSchema>;
