import { z } from 'zod';

export const AdminStatsSchema = z.object({
  totalUsers: z.number(),
  activeWallets: z.number(),
  totalVolumeMinor: z.number(),
  pending: z.number()
});

export type AdminStatsDto = z.infer<typeof AdminStatsSchema>;
