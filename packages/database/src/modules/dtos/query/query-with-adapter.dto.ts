import { z } from 'zod';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

import { QueryOptionsSchema } from './query-options.dto';

export const QueryWithAdapterSchema = QueryOptionsSchema.extend({
  adapter: z.custom<DatabaseAdapter>().optional()
});

export type QueryWithAdapterDto = z.infer<typeof QueryWithAdapterSchema>;
