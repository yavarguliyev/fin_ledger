import { z } from 'zod';

import { CurrencyVolumeSchema } from './currency-volume.dto';

export const AdminStatsSchema = z.object({
  totalUsers: z.number(),

  activeWallets: z.number(),

  volumes: z.array(CurrencyVolumeSchema),

  pending: z.number()
});

export type AdminStatsDto = z.infer<typeof AdminStatsSchema>;
