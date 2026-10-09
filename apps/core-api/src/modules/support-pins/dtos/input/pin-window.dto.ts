import { z } from 'zod';

export const PinWindowSchema = z.object({
  messageId: z.string({ message: 'Message ID must be a string' }),

  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  seconds: z.number({ message: 'Seconds must be a number' })
});

export type PinWindowDto = z.infer<typeof PinWindowSchema>;
