import { z } from 'zod';
import { WALLET_STATUS } from '@common/libs';

export const UpdateWalletStatusSchema = z.object({
  status: z.enum(WALLET_STATUS, { message: 'Status must be ACTIVE, SUSPENDED, or CLOSED' })
});

export type UpdateWalletStatusDto = z.infer<typeof UpdateWalletStatusSchema>;
