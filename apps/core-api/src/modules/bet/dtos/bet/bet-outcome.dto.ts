import { z } from 'zod';
import { BET_STATUSES } from '@common/contracts';

export const BetOutcomeSchema = z.object({
  status: z.enum(BET_STATUSES, { message: 'Status must be a valid bet status' }),

  payoutMinor: z
    .number({ message: 'Payout must be a number' })
    .int({ message: 'Payout must be an integer' })
    .nonnegative({ message: 'Payout cannot be negative' })
});

export type BetOutcomeDto = z.infer<typeof BetOutcomeSchema>;
