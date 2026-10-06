import { z } from 'zod';

export const MetaTextSchema = z.object({
  value: z.string().optional(),

  max: z.number().int().positive()
});

export type MetaTextDto = z.infer<typeof MetaTextSchema>;
