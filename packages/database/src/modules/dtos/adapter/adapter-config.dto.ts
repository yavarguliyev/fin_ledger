import { z } from 'zod';

import type { DatabaseConfig } from '../../interfaces/database-config.interface';

export const AdapterConfigSchema = z.object({
  config: z.custom<DatabaseConfig>()
});

export type AdapterConfigDto = z.infer<typeof AdapterConfigSchema>;
