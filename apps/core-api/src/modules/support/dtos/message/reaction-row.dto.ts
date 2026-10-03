import { z } from 'zod';

export const ReactionRowSchema = z.object({
  messageId: z.string({ message: 'Message ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  emoji: z.string({ message: 'Emoji must be a string' }),

  createdAt: z.string({ message: 'Created at must be a string' })
});

export type ReactionRowDto = z.infer<typeof ReactionRowSchema>;
