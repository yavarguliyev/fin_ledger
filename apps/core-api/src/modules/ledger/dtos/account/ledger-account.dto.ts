import { z } from 'zod';
import { AccountType } from '@common/libs';

export const LedgerAccountSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  createdAt: z.string({ message: 'Created at must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  userId: z.string({ message: 'User ID must be a string' }),

  updatedAt: z.string({ message: 'Updated at must be a string' }),

  balanceMinor: z.number({ message: 'Balance must be a number' }).int({ message: 'Balance must be an integer' }),

  availableBalanceMinor: z.number({ message: 'Available balance must be a number' }).int({ message: 'Available balance must be an integer' }),

  reservedBalanceMinor: z.number({ message: 'Reserved balance must be a number' }).int({ message: 'Reserved balance must be an integer' }),

  accountType: z.enum(AccountType, { message: 'Account type must be a valid account type' })
});

export type LedgerAccountDto = z.infer<typeof LedgerAccountSchema>;
