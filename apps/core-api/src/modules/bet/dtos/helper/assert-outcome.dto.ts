import { z } from 'zod';

import { BetSchema } from '../bet/bet.dto';
import { BetOutcomeSchema } from '../bet/bet-outcome.dto';

export const AssertOutcomeSchema = z.object({
  outcome: BetOutcomeSchema,

  bet: BetSchema
});

export type AssertOutcomeDto = z.infer<typeof AssertOutcomeSchema>;
