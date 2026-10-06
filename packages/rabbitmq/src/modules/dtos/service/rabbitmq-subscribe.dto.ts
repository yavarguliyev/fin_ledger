import { z } from 'zod';
import { HandleRecord } from '@common/shared-libs';
import type { InboxRepository } from '@common/database';

export const RabbitmqSubscribeSchema = z.object({
  queue: z.string({ message: 'Queue must be a string' }),

  routingKey: z.string({ message: 'Routing key must be a string' }),

  handler: z.custom<HandleRecord>(),

  inbox: z.custom<InboxRepository>().optional()
});

export type RabbitmqSubscribeDto = z.infer<typeof RabbitmqSubscribeSchema>;
