import { z } from 'zod';

export const StoredPresenceSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  role: z.string({ message: 'Role must be a string' }),

  lastSeenAt: z.string({ message: 'Last seen at must be a string' })
});

export type StoredPresenceDto = z.infer<typeof StoredPresenceSchema>;
