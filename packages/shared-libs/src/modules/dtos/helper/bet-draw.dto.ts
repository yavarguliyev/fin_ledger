import { z } from 'zod';

export const BetDrawSchema = z.object({
  odds: z.number({ message: 'Odds must be a number' }),

  margin: z.number({ message: 'Margin must be a number' })
});

export type BetDrawDto = z.infer<typeof BetDrawSchema>;
