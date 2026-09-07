import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const UpdateWalletBalancesSchema = z.object({
  expectedVersion: z.number({ message: 'Expected version must be a number' }).int({ message: 'Expected version must be an integer' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  availableBalanceMinor: z.number({ message: 'Available balance must be a number' }).int({ message: 'Available balance must be an integer' }),

  reservedBalanceMinor: z.number({ message: 'Reserved balance must be a number' }).int({ message: 'Reserved balance must be an integer' })
});

export type UpdateWalletBalancesDto = z.infer<typeof UpdateWalletBalancesSchema> & { adapter: DatabaseAdapter };
