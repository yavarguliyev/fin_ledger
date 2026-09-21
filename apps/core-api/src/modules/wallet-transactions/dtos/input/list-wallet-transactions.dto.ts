import { z } from 'zod';
import { UserRoles, WalletTransactionType } from '@common/libs';

import { ListWalletTransactionsRequestSchema } from '../request/list-wallet-transactions-request.dto';

export const ListWalletTransactionsSchema = ListWalletTransactionsRequestSchema.extend({
  type: z.enum(WalletTransactionType, { message: 'Transaction type must be a valid wallet transaction type' }).optional(),

  role: z.enum(UserRoles, { message: 'Role must be a valid user role' }).optional()
});

export type ListWalletTransactionsDto = z.infer<typeof ListWalletTransactionsSchema>;
