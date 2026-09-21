import { z } from 'zod';

export const CircuitBreakerOptionsSchema = z.object({
  name: z.string({ message: 'Name must be a string' }),

  failureThreshold: z.number({ message: 'failureThreshold must be a number' }).optional(),

  resetTimeoutMs: z.number({ message: 'resetTimeoutMs must be a number' }).optional()
});

export type CircuitBreakerOptionsDto = z.infer<typeof CircuitBreakerOptionsSchema>;
