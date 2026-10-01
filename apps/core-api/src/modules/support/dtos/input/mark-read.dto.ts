import { z } from 'zod';

export const MarkReadSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1, { message: 'Conversation ID is required' }),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  lastReadMessageId: z.string({ message: 'Last read message ID must be a string' }).optional()
});

export type MarkReadDto = z.infer<typeof MarkReadSchema>;
