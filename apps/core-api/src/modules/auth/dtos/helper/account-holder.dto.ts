import { z } from 'zod';

export const AccountHolderSchema = z.object({
  user: z.object({ id: z.string({ message: 'ID must be a string' }), email: z.string({ message: 'Email must be a string' }) })
});

export type AccountHolderDto = z.infer<typeof AccountHolderSchema>;
