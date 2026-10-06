import { z } from 'zod';

export const LockRowSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  unlockedUntil: z.date({ message: 'Unlocked until must be a date' }).nullable(),

  createdAt: z.date({ message: 'Created at must be a date' })
});

export type LockRowDto = z.infer<typeof LockRowSchema>;
