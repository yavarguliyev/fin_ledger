import { z } from 'zod';

export const QueryRowsSchema = z.object({
  rows: z.array(z.unknown())
});

export type QueryRowsDto = z.infer<typeof QueryRowsSchema>;
