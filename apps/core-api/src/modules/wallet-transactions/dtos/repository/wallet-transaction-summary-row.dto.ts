import { z } from 'zod';

export const WalletTransactionSummaryRowSchema = z.object({
  currency: z.string({ message: 'Currency must be a string' }),

  deposits: z.string({ message: 'Deposits must be a string' }),

  withdrawals: z.string({ message: 'Withdrawals must be a string' }),

  winnings: z.string({ message: 'Winnings must be a string' }),

  betsCount: z.number({ message: 'Bets count must be a number' })
});

export type WalletTransactionSummaryRowDto = z.infer<typeof WalletTransactionSummaryRowSchema>;
