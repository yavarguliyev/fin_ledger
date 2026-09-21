import { z } from 'zod';
import { AccountOwnerType, AccountType } from '@common/libs';

export const LedgerAccountSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  ownerType: z.enum(AccountOwnerType, { message: 'Owner type must be USER or SYSTEM' }),

  userId: z.string({ message: 'User ID must be a string' }).nullable(),

  code: z.string({ message: 'Code must be a string' }).nullable(),

  accountType: z.enum(AccountType, { message: 'Account type must be a valid account type' }),

  currency: z.string({ message: 'Currency must be a string' }),

  balanceMinor: z.number({ message: 'Balance must be a number' }).int({ message: 'Balance must be an integer' }),

  isActive: z.boolean({ message: 'Is active must be a boolean' }),

  version: z.number({ message: 'Version must be a number' }).int({ message: 'Version must be an integer' }),

  createdAt: z.string({ message: 'Created at must be a string' }),

  updatedAt: z.string({ message: 'Updated at must be a string' })
});

export type LedgerAccountDto = z.infer<typeof LedgerAccountSchema>;
