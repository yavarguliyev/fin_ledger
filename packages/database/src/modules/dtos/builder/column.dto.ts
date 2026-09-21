import { z } from 'zod';

export const ColumnSchema = z.object({
  column: z.string({ message: 'Column must be a string' })
});

export type ColumnDto = z.infer<typeof ColumnSchema>;
