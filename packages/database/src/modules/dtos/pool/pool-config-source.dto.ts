import { z } from 'zod';

import type { DatabaseConfig } from '../../interfaces/database-config.interface';

export const PoolConfigSourceSchema = z.object({ config: z.custom<DatabaseConfig>() });

export type PoolConfigSourceDto = z.infer<typeof PoolConfigSourceSchema>;
