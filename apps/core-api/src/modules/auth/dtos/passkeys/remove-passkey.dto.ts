import { z } from 'zod';

export const RemovePasskeySchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  id: z.string({ message: 'ID must be a string' })
});

export type RemovePasskeyDto = z.infer<typeof RemovePasskeySchema>;
