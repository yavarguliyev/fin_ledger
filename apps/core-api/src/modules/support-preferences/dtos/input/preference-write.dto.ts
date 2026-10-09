import { z } from 'zod';

export const PreferenceWriteSchema = z.object({
  sql: z.string({ message: 'SQL must be a string' }),

  params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))
});

export type PreferenceWriteDto = z.infer<typeof PreferenceWriteSchema>;
