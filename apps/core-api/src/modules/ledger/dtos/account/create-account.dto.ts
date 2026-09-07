import { z } from 'zod';
import { AccountType, DatabaseAdapter } from '@common/libs';

export const CreateLedgerAccountSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  accountType: z.enum(Object.values(AccountType) as [string, ...string[]], {
    message: 'Account type must be LIABILITY, ASSET, REVENUE, or EXPENSE'
  }),

  currency: z
    .string({ message: 'Currency must be a string' })
    .min(1, { message: 'Currency is required' })
    .length(3, { message: 'Currency must be a 3-character ISO code' })
});

export type CreateLedgerAccountDto = z.infer<typeof CreateLedgerAccountSchema>;

export type CreateLedgerAccount = CreateLedgerAccountDto & { adapter?: DatabaseAdapter | undefined };
