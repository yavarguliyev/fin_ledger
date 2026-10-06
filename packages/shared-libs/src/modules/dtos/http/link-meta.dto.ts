import { z } from 'zod';

export const LinkMetaSchema = z.object({
  title: z.string().optional(),

  description: z.string().optional(),

  image: z.string().optional()
});

export type LinkMetaDto = z.infer<typeof LinkMetaSchema>;
