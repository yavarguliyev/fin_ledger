import { z } from 'zod';
import { WalletStatus } from '@common/libs';

import { WalletIdRequestSchema } from './wallet-id-request.dto';

export const UpdateWalletStatusSchema = WalletIdRequestSchema.extend({
  status: z.enum(WalletStatus, { message: 'Status must be ACTIVE, SUSPENDED, or CLOSED' })
});

export type UpdateWalletStatusDto = z.infer<typeof UpdateWalletStatusSchema>;
