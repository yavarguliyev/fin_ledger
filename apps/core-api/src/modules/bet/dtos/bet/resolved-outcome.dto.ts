import { z } from 'zod';

import { BetOutcomeSchema } from './bet-outcome.dto';

export const ResolvedOutcomeSchema = BetOutcomeSchema.extend({
  drawValue: z.number({ message: 'Draw value must be a number' }).int(),

  drawThreshold: z.number({ message: 'Draw threshold must be a number' }).int()
});

export type ResolvedOutcomeDto = z.infer<typeof ResolvedOutcomeSchema>;
