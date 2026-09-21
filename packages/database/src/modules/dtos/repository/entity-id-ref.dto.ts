import { z } from 'zod';
import { EntityId } from '@common/shared-libs';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const EntityIdRefSchema = z.object({
  id: z.custom<EntityId>(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type EntityIdRefDto = z.infer<typeof EntityIdRefSchema>;
