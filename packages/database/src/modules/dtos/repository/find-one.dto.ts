import { z } from 'zod';
import { UnknownRecord } from '@common/shared-libs';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const FindOneSchema = z.object({
  where: z.custom<UnknownRecord>(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type FindOneDto = z.infer<typeof FindOneSchema>;
