import { z } from 'zod';

import { AuthSchema } from '../auth/auth.dto';

export const UserWalletAndLedgerSchema = z.object({
  user: AuthSchema,

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' })
});

export type UserWalletAndLedgerDto = z.infer<typeof UserWalletAndLedgerSchema>;
