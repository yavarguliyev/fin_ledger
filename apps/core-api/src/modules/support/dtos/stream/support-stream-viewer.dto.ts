import { z } from 'zod';

export const SupportStreamViewerSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  role: z.string({ message: 'Role must be a string' })
});

export type SupportStreamViewerDto = z.infer<typeof SupportStreamViewerSchema>;
