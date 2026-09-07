import { z } from 'zod';
import { DatabaseAdapter, RemoveUndefined, WalletStatus } from '@common/libs';

export const CreateWalletSchema = z.object({
  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }).optional(),

  userId: z.string({ message: 'User ID must be a string' }),

  availableBalanceMinor: z.number({ message: 'Available balance must be a number' }).int({ message: 'Available balance must be an integer' }),

  reservedBalanceMinor: z.number({ message: 'Reserved balance must be a number' }).int({ message: 'Reserved balance must be an integer' }),

  version: z.number({ message: 'Version must be a number' }).int({ message: 'Version must be an integer' }).optional(),

  status: z.enum(WalletStatus, { message: 'Status must be a valid wallet status' }).optional(),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }).optional()
});

export type CreateWalletDto = RemoveUndefined<z.infer<typeof CreateWalletSchema>> & { adapter: DatabaseAdapter };
