import { z } from 'zod';

export const BrokerPublishSchema = z.object({
  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  routingKey: z.string({ message: 'Routing key must be a string' }),

  headers: z.record(z.string(), z.string(), { message: 'Headers must be strings' }).optional()
});

export type BrokerPublishDto = z.infer<typeof BrokerPublishSchema>;
