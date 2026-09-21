import { z } from 'zod';

import { BetOutcomeSchema } from '../bet/bet-outcome.dto';

export const SettleBetSchema = z.object({
  betId: z.string({ message: 'Bet ID must be a string' }).min(1, { message: 'Bet ID is required' }),

  outcome: BetOutcomeSchema.optional()
});

export type SettleBetDto = z.infer<typeof SettleBetSchema>;
