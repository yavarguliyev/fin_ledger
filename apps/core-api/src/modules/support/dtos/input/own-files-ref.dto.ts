import { z } from 'zod';

export const OwnFilesRefSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1),

  userId: z.string({ message: 'User ID must be a string' }).min(1),

  messageIds: z.array(z.string({ message: 'Message ID must be a string' }), { message: 'Message IDs must be a list' })
});

export type OwnFilesRefDto = z.infer<typeof OwnFilesRefSchema>;
