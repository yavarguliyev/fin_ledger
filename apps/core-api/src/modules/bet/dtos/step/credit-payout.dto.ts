import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { BetSchema } from '../bet/bet.dto';

export const CreditPayoutSchema = z.object({
  bet: BetSchema,

  payoutMinor: z.number({ message: 'Payout must be a number' }).int({ message: 'Payout must be an integer' }).positive({ message: 'Payout must be positive' }),

  adapter: z.custom<DatabaseAdapter>()
});

export type CreditPayoutDto = z.infer<typeof CreditPayoutSchema>;
