import { z } from 'zod';

import type { ColumnMapping } from '../../interfaces/column-mapping.interface';

export const ColumnMappingsSchema = z.object({
  columnMappings: z.custom<ColumnMapping>()
});

export type ColumnMappingsDto = z.infer<typeof ColumnMappingsSchema>;
