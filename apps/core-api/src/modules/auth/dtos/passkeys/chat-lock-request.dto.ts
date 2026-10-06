import { z } from 'zod';

export const ChatLockRequestSchema = z.object({
  conversationId: z.uuid({ message: 'Conversation ID must be a valid UUID' })
});

export type ChatLockRequestDto = z.infer<typeof ChatLockRequestSchema>;
