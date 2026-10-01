import { z } from 'zod';

export const HideMessageSchema = z.object({
  messageId: z.string({ message: 'Message ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' })
});

export type HideMessageDto = z.infer<typeof HideMessageSchema>;
