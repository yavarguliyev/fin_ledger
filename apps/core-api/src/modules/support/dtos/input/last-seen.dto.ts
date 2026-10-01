import { z } from 'zod';

export const LastSeenSchema = z.object({
  targetUserId: z.string({ message: 'Target user ID must be a string' }).min(1, { message: 'Target user ID is required' }),

  role: z.string({ message: 'Role must be a string' })
});

export type LastSeenDto = z.infer<typeof LastSeenSchema>;
