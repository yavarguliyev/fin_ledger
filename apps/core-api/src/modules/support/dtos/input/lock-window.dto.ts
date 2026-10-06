import { z } from 'zod';

export const LockWindowSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }).min(1),

  userId: z.string({ message: 'User ID must be a string' }).min(1),

  seconds: z.number({ message: 'Seconds must be a number' }).int().positive()
});

export type LockWindowDto = z.infer<typeof LockWindowSchema>;
