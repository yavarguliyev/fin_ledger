import { z } from 'zod';

export const WalletSummarySchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }).optional(),

  availableBalanceMinor: z
    .number({ message: 'Available balance must be a number' })
    .int({ message: 'Available balance must be an integer' })
    .optional()
});

export type WalletSummaryDto = z.infer<typeof WalletSummarySchema>;
