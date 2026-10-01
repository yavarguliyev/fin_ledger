import { z } from 'zod';

export const HeartbeatSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  role: z.string({ message: 'Role must be a string' })
});

export type HeartbeatDto = z.infer<typeof HeartbeatSchema>;
