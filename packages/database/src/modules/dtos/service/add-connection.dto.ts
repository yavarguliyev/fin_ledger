import { z } from 'zod';

import type { DatabaseConfig } from '../../interfaces/database-config.interface';

export const AddConnectionSchema = z.object({
  name: z.string({ message: 'Connection name must be a string' }),

  config: z.custom<DatabaseConfig>(),

  isReadOnly: z.boolean().optional()
});

export type AddConnectionDto = z.infer<typeof AddConnectionSchema>;
