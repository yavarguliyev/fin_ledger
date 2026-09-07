import { z } from 'zod';

import { WalletSchema } from '../../../wallet/dtos/wallet/wallet.dto';

export const CreateLedgerEntriesParamsSchema = z.object({
  wallet: WalletSchema,

  isDebit: z.boolean({ message: 'Is debit must be a boolean' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  systemAccountId: z.string({ message: 'System account ID must be a string' }),

  referenceValue: z.string({ message: 'Reference value must be a string' }).optional()
});

export type CreateLedgerEntriesParamsDto = z.infer<typeof CreateLedgerEntriesParamsSchema>;
