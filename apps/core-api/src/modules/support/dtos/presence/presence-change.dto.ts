import { z } from 'zod';

import { PresenceEntrySchema } from './presence-entry.dto';

export const PresenceChangeSchema = z.object({ presence: PresenceEntrySchema });

export type PresenceChangeDto = z.infer<typeof PresenceChangeSchema>;
