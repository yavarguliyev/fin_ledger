import { z } from 'zod';

import type { ColumnMapping } from '../../interfaces/column-mapping.interface';

export const BuilderOptionsSchema = z.object({
  tableName: z.string({ message: 'Table name must be a string' }),

  columnMappings: z.custom<ColumnMapping>().optional()
});

export type BuilderOptionsDto = z.infer<typeof BuilderOptionsSchema>;
