import { z } from 'zod';

import type { DatabaseAdapter } from '../../interfaces/database-adapter.interface';

export const ClaimPendingBatchSchema = z.object({
  limit: z.number({ message: 'Limit must be a number' }).int().positive(),

  lockedBy: z.string({ message: 'Locked by must be a string' }),

  lockSeconds: z.number({ message: 'Lock seconds must be a number' }).int().positive(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type ClaimPendingBatchDto = z.infer<typeof ClaimPendingBatchSchema>;
