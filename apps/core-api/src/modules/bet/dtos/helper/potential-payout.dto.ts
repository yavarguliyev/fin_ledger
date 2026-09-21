import { z } from 'zod';

export const PotentialPayoutSchema = z.object({
  stakeMinor: z.number({ message: 'Stake must be a number' }).int({ message: 'Stake must be an integer' }),

  odds: z.string({ message: 'Odds must be a string' })
});

export type PotentialPayoutDto = z.infer<typeof PotentialPayoutSchema>;
