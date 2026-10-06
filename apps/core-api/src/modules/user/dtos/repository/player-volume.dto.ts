import { z } from 'zod';

export const PlayerVolumeSchema = z.object({
  currency: z.string(),

  amountMinor: z.number()
});

export type PlayerVolumeDto = z.infer<typeof PlayerVolumeSchema>;
