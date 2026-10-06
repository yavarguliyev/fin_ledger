import { z } from 'zod';

export const MessageAccessSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1),

  messageId: z.string({ message: 'Message ID must be a string' }).min(1),

  userId: z.string({ message: 'User ID must be a string' }).min(1),

  role: z.string({ message: 'Role must be a string' })
});

export type MessageAccessDto = z.infer<typeof MessageAccessSchema>;
