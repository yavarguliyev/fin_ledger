import { z } from 'zod';
import { HandleRecord } from '@common/shared-libs';

export const RabbitmqSubscribeSchema = z.object({
  queue: z.string({ message: 'Queue must be a string' }),

  routingKey: z.string({ message: 'Routing key must be a string' }),

  handler: z.custom<HandleRecord>()
});

export type RabbitmqSubscribeDto = z.infer<typeof RabbitmqSubscribeSchema>;
