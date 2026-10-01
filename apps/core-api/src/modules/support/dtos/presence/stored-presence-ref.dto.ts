import { z } from 'zod';

import { StoredPresenceSchema } from './stored-presence.dto';

export const StoredPresenceRefSchema = z.object({ entry: StoredPresenceSchema });

export type StoredPresenceRefDto = z.infer<typeof StoredPresenceRefSchema>;
