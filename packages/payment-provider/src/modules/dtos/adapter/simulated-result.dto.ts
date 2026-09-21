import { z } from 'zod';

export const SimulatedResultSchema = z.object({
  prefix: z.string({ message: 'Prefix must be a string' }),

  amount: z.number({ message: 'Amount must be a number' }).int(),

  currency: z.string({ message: 'Currency must be a string' })
});

export type SimulatedResultDto = z.infer<typeof SimulatedResultSchema>;
