import { z } from 'zod';

export const CalculateNewBalancesSchema = z.object({
  newAvailable: z.number({ message: 'New available balance must be a number' }),

  newReserved: z.number({ message: 'New reserved balance must be a number' })
});

export type CalculateNewBalancesDto = z.infer<typeof CalculateNewBalancesSchema>;
