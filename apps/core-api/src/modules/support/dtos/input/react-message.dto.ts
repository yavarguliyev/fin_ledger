import { z } from 'zod';

export const ReactMessageSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  messageId: z.string({ message: 'Message ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  role: z.string({ message: 'Role must be a string' }),

  emoji: z.string({ message: 'Emoji must be a string' }).nullable()
});

export type ReactMessageDto = z.infer<typeof ReactMessageSchema>;
