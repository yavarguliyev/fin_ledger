import { z } from 'zod';

import { AdminStatsSchema } from './admin-stats.dto';
import { UserWithWalletSchema } from '../../user/dtos/user/user-with-wallet.dto';

export const AdminDashboardSchema = z.object({
  stats: AdminStatsSchema,
  users: z.array(UserWithWalletSchema)
});

export type AdminDashboardDto = z.infer<typeof AdminDashboardSchema>;
