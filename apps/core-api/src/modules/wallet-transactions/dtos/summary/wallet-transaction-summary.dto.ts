import { z } from 'zod';

export const WalletTransactionSummarySchema = z.object({
  totalDepositsMinor: z.number({ message: 'Total deposits must be a number' }).int({ message: 'Total deposits must be an integer' }),

  totalWithdrawalsMinor: z.number({ message: 'Total withdrawals must be a number' }).int({ message: 'Total withdrawals must be an integer' }),

  totalWinningsMinor: z.number({ message: 'Total winnings must be a number' }).int({ message: 'Total winnings must be an integer' }),

  betsCount: z.number({ message: 'Bets count must be a number' }).int({ message: 'Bets count must be an integer' })
});

export type WalletTransactionSummaryDto = z.infer<typeof WalletTransactionSummarySchema>;
