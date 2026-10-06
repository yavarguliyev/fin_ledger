import { z } from 'zod';

import { BET_STATUSES } from '../betting/bet-values.contract';

export const BetSettledV1Schema = z.object({
  betId: z.string({ message: 'Bet ID must be a string' }).min(1),

  userId: z.string({ message: 'User ID must be a string' }).min(1),

  walletId: z.string({ message: 'Wallet ID must be a string' }).min(1),

  status: z.enum(BET_STATUSES, { message: 'Status must be a valid bet status' }),

  selection: z.string({ message: 'Selection must be a string' }),

  payoutMinor: z.number({ message: 'Payout must be a number' }).int(),

  currency: z.string({ message: 'Currency must be a string' }).min(1)
});

export type BetSettledV1 = z.infer<typeof BetSettledV1Schema>;
