import { z } from 'zod';

export const QuerySchema = z.object({
  sql: z.string({ message: 'SQL must be a string' }),

  params: z.array(z.unknown()).optional()
});

export type QueryDto = z.infer<typeof QuerySchema>;
