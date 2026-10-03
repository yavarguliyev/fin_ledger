import { z } from 'zod';

export const SetReactionSchema = z.object({
  messageId: z.string({ message: 'Message ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  emoji: z.string({ message: 'Emoji must be a string' })
});

export type SetReactionDto = z.infer<typeof SetReactionSchema>;
