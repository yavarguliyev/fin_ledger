import { z } from 'zod';
import { AccountType, DatabaseAdapter } from '@common/libs';

export const CreateLedgerAccountSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  accountType: z.enum(AccountType, { message: 'Account type must be a valid account type' }),

  currency: z.string({ message: 'Currency must be a string' }).length(3, { message: 'Currency must be a 3-character ISO code' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type CreateLedgerAccountDto = z.infer<typeof CreateLedgerAccountSchema>;
