import { z } from 'zod';

import { UserWithWalletSchema } from '../../../user/dtos/user/user-with-wallet.dto';

export const BuildAdminStatsSchema = z.object({
  users: z.array(UserWithWalletSchema),

  pending: z.number({ message: 'Pending must be a number' }).int({ message: 'Pending must be an integer' })
});

export type BuildAdminStatsDto = z.infer<typeof BuildAdminStatsSchema>;
