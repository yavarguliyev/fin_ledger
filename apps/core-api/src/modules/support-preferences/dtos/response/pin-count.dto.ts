import { z } from 'zod';

export const PinCountSchema = z.object({
  count: z.number({ message: 'Count must be a number' })
});

export type PinCountDto = z.infer<typeof PinCountSchema>;
