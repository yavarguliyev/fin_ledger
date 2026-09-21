import { z } from 'zod';

import type { ColumnMapping } from '../../interfaces/column-mapping.interface';
import type { PostgresService } from '../../postgres/services/postgres.service';

export const RepositoryOptionsSchema = z.object({
  service: z.custom<PostgresService>(),

  tableName: z.string({ message: 'Table name must be a string' }),

  columnMappings: z.custom<ColumnMapping>().optional()
});

export type RepositoryOptionsDto = z.infer<typeof RepositoryOptionsSchema>;
