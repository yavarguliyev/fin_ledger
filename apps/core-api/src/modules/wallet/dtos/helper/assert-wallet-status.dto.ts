import { z } from 'zod';
import { WalletStatus } from '@common/libs';

export const AssertWalletStatusSchema = z.object({
  status: z.enum(WalletStatus, { message: 'Status must be a valid wallet status' }).optional(),

  allowedStatuses: z.array(z.enum(WalletStatus, { message: 'Status must be a valid wallet status' }))
});

export type AssertWalletStatusDto = z.infer<typeof AssertWalletStatusSchema>;
