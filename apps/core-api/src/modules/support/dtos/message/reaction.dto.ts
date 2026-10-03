import { z } from 'zod';

export const ReactionSchema = z.object({
  emoji: z.string({ message: 'Emoji must be a string' }),

  userId: z.string({ message: 'User ID must be a string' })
});

export type ReactionDto = z.infer<typeof ReactionSchema>;
