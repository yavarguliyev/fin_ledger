import { z } from 'zod';

export const BetDrawResultSchema = z.object({
  drawValue: z.number({ message: 'Draw value must be a number' }).int(),

  drawThreshold: z.number({ message: 'Draw threshold must be a number' }).int(),

  won: z.boolean({ message: 'Won must be a boolean' })
});

export type BetDrawResultDto = z.infer<typeof BetDrawResultSchema>;
