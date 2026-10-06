import { z } from 'zod';

export const QueueAddressSchema = z.object({
  prefix: z.string({ message: 'Prefix must be a string' }),

  queue: z.string({ message: 'Queue must be a string' })
});

export type QueueAddressDto = z.infer<typeof QueueAddressSchema>;
