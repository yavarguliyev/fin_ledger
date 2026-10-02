import { z } from 'zod';

export const PresenceStatusSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  online: z.boolean({ message: 'Online must be a boolean' }),

  lastSeenAt: z.string({ message: 'Last seen at must be a string' }).nullable()
});

export type PresenceStatusDto = z.infer<typeof PresenceStatusSchema>;
