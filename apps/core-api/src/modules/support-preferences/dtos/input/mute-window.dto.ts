import { z } from 'zod';

export const MuteWindowSchema = z.object({
  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  seconds: z.number({ message: 'Seconds must be a number' }).nullable()
});

export type MuteWindowDto = z.infer<typeof MuteWindowSchema>;
