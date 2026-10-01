import { z } from 'zod';

import { BetSchema } from '../bet/bet.dto';

export const ResolveOutcomeSchema = z.object({
  bet: BetSchema,

  margin: z.number({ message: 'Margin must be a number' })
});

export type ResolveOutcomeDto = z.infer<typeof ResolveOutcomeSchema>;
