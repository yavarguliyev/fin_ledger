import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { PersistSightingSchema } from './persist-sighting.dto';

export const WriteSightingSchema = PersistSightingSchema.extend({
  adapter: z.custom<DatabaseAdapter>()
});

export type WriteSightingDto = z.infer<typeof WriteSightingSchema>;
