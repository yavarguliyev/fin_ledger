import { z } from 'zod';
import { WALLET_STATUSES } from '@common/contracts';

import { WalletIdRequestSchema } from './wallet-id-request.dto';

export const UpdateWalletStatusSchema = WalletIdRequestSchema.extend({
  status: z.enum(WALLET_STATUSES, { message: 'Status must be ACTIVE, SUSPENDED, or CLOSED' })
});

export type UpdateWalletStatusDto = z.infer<typeof UpdateWalletStatusSchema>;
