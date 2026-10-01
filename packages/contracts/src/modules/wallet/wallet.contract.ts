import { z } from 'zod';

import { WALLET_STATUSES } from './wallet-values.contract';

export const WalletContractSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  availableBalanceMinor: z.number({ message: 'Available balance must be a number' }).int({ message: 'Available balance must be an integer' }),

  reservedBalanceMinor: z.number({ message: 'Reserved balance must be a number' }).int({ message: 'Reserved balance must be an integer' }),

  version: z.number({ message: 'Version must be a number' }).int({ message: 'Version must be an integer' }),

  status: z.enum(WALLET_STATUSES, { message: 'Status must be a valid wallet status' }),

  createdAt: z.string({ message: 'Created at must be a string' }),

  updatedAt: z.string({ message: 'Updated at must be a string' })
});

export type WalletContract = z.infer<typeof WalletContractSchema>;
