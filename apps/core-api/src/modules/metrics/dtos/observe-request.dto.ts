import { z } from 'zod';

export const ObserveRequestSchema = z.object({
  method: z.string({ message: 'Method must be a string' }),

  route: z.string({ message: 'Route must be a string' }),

  status: z.number({ message: 'Status must be a number' }).int(),

  seconds: z.number({ message: 'Seconds must be a number' })
});

export type ObserveRequestDto = z.infer<typeof ObserveRequestSchema>;
