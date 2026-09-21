import { z } from 'zod';

export const RabbitmqPublishSchema = z.object({
  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  routingKey: z.string({ message: 'Routing key must be a string' }),

  exchange: z.string({ message: 'Exchange must be a string' }).optional(),

  persistent: z.boolean({ message: 'Persistent must be a boolean' }).optional()
});

export type RabbitmqPublishDto = z.infer<typeof RabbitmqPublishSchema>;
