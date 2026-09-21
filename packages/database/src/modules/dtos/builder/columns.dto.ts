import { z } from 'zod';

export const ColumnsSchema = z.object({
  columns: z.array(z.string())
});

export type ColumnsDto = z.infer<typeof ColumnsSchema>;
