import { z } from 'zod';
import { SupportDeleteScope } from '@common/libs';

export const DeleteMessageSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1, { message: 'Conversation ID is required' }),

  messageId: z.string({ message: 'Message ID must be a string' }).min(1, { message: 'Message ID is required' }),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  role: z.string({ message: 'Role must be a string' }),

  scope: z.enum(SupportDeleteScope, { message: 'Scope must be ME or EVERYONE' })
});

export type DeleteMessageDto = z.infer<typeof DeleteMessageSchema>;
