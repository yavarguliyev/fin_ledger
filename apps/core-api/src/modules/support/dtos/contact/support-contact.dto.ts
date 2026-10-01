import { z } from 'zod';

export const SupportContactSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  role: z.string({ message: 'Role must be a string' })
});

export type SupportContactDto = z.infer<typeof SupportContactSchema>;
