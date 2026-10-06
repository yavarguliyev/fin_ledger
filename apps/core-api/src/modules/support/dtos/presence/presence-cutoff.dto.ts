import { z } from 'zod';

export const PresenceCutoffSchema = z.object({
  cutoff: z.number({ message: 'Cutoff must be a number' })
});

export type PresenceCutoffDto = z.infer<typeof PresenceCutoffSchema>;
