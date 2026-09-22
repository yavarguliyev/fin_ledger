import { z } from 'zod';

export const DriftRowSchema = z.object({
  currency: z.string()
});

export type DriftRowDto = z.infer<typeof DriftRowSchema>;
