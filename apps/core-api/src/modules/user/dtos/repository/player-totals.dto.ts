import { z } from 'zod';

export const PlayerTotalsSchema = z.object({
  totalUsers: z.number(),

  activeWallets: z.number()
});

export type PlayerTotalsDto = z.infer<typeof PlayerTotalsSchema>;
