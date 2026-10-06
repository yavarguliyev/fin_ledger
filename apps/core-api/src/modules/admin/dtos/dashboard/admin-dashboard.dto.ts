import { z } from 'zod';

import { AdminStatsSchema } from './admin-stats.dto';

export const AdminDashboardSchema = z.object({
  stats: AdminStatsSchema
});

export type AdminDashboardDto = z.infer<typeof AdminDashboardSchema>;
