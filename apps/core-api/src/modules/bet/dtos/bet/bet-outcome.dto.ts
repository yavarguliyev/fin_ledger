import { z } from 'zod';
import { BetStatus } from '@common/libs';

export const BetOutcomeSchema = z.object({
  status: z.enum(BetStatus, { message: 'Status must be a valid bet status' }),

  payoutMinor: z.number({ message: 'Payout must be a number' }).int({ message: 'Payout must be an integer' }).nonnegative({ message: 'Payout cannot be negative' })
});

export type BetOutcomeDto = z.infer<typeof BetOutcomeSchema>;
