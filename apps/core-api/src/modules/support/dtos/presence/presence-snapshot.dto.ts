import { z } from 'zod';

import { StoredPresenceSchema } from './stored-presence.dto';

export const PresenceSnapshotSchema = z.object({
  userIds: z.array(z.string({ message: 'User ID must be a string' })),

  online: z.array(StoredPresenceSchema.nullable()),

  lastSeen: z.array(z.string({ message: 'Last seen must be a string' }).nullable())
});

export type PresenceSnapshotDto = z.infer<typeof PresenceSnapshotSchema>;
