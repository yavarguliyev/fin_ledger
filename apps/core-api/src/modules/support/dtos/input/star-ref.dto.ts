import { z } from 'zod';

export const StarRefSchema = z.object({
  messageId: z.string({ message: 'Message ID must be a string' }).min(1),

  userId: z.string({ message: 'User ID must be a string' }).min(1)
});

export type StarRefDto = z.infer<typeof StarRefSchema>;
