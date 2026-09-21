import { z } from 'zod';
import { WalletStatus } from '@common/libs';

import { WalletSchema } from '../wallet/wallet.dto';

export const ValidateWalletTransactionSchema = z.object({
  wallet: WalletSchema.nullable(),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  requiredToCheckAmountMinor: z.boolean({ message: 'requiredToCheckAmountMinor must be a boolean' }),

  allowedStatuses: z.array(z.enum(WalletStatus, { message: 'Status must be a valid wallet status' })).optional()
});

export type ValidateWalletTransactionDto = z.infer<typeof ValidateWalletTransactionSchema>;
