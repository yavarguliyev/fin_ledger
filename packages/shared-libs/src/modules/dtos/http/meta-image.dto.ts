import { z } from 'zod';

export const MetaImageSchema = z.object({
  value: z.string().optional(),

  url: z.string()
});

export type MetaImageDto = z.infer<typeof MetaImageSchema>;
