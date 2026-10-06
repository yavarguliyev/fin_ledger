import { z } from 'zod';

export const DeleteOwnFilesSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1, { message: 'Conversation ID is required' }),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  role: z.string({ message: 'Role must be a string' }),

  messageIds: z.array(z.string({ message: 'Message ID must be a string' }), { message: 'Message IDs must be a list' })
});

export type DeleteOwnFilesDto = z.infer<typeof DeleteOwnFilesSchema>;
