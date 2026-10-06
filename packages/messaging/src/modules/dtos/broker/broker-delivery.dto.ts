import { z } from 'zod';

import { BrokerSubscribeSchema } from './broker-subscribe.dto';

export const BrokerDeliverySchema = BrokerSubscribeSchema.omit({ routingKey: true }).extend({
  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  eventId: z.string({ message: 'Event ID must be a string' }).optional()
});

export type BrokerDeliveryDto = z.infer<typeof BrokerDeliverySchema>;
