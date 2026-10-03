import { z } from 'zod';

export const ClearReactionSchema = z.object({
  messageId: z.string({ message: 'Message ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' })
});

export type ClearReactionDto = z.infer<typeof ClearReactionSchema>;
