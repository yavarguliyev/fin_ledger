import { z } from 'zod';

export const ChangedEmailSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  previousEmail: z.string({ message: 'Previous email must be a string' }),

  newEmail: z.string({ message: 'New email must be a string' })
});

export type ChangedEmailDto = z.infer<typeof ChangedEmailSchema>;
