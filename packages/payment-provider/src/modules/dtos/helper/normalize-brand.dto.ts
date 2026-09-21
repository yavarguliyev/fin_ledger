import { z } from 'zod';

export const NormalizeBrandSchema = z.object({
  brand: z.string().optional()
});

export type NormalizeBrandDto = z.infer<typeof NormalizeBrandSchema>;
