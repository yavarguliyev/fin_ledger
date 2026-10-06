import { z } from 'zod';

export const StarRowSchema = z.object({
  messageId: z.string({ message: 'Message ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  createdAt: z.date({ message: 'Created at must be a date' })
});

export type StarRowDto = z.infer<typeof StarRowSchema>;
