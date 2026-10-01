import { z } from 'zod';
import { WALLET_STATUSES } from '@common/contracts';

export const AssertWalletStatusSchema = z.object({
  status: z.enum(WALLET_STATUSES, { message: 'Status must be a valid wallet status' }).optional(),

  allowedStatuses: z.array(z.enum(WALLET_STATUSES, { message: 'Status must be a valid wallet status' }))
});

export type AssertWalletStatusDto = z.infer<typeof AssertWalletStatusSchema>;
