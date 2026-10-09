import { z } from 'zod';

import { PRESENCE_STATES } from './support-values.contract';

export const PresenceContractSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  role: z.string({ message: 'Role must be a string' }),

  state: z.enum(PRESENCE_STATES, { message: 'State must be a valid presence state' }),

  lastSeenAt: z.string({ message: 'Last seen at must be a string' }).nullable(),

  avatarUrl: z.string({ message: 'Avatar URL must be a string' }).nullable().optional()
});

export type PresenceContract = z.infer<typeof PresenceContractSchema>;
