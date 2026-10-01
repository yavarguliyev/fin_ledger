import type { ConfirmChannel } from 'amqplib';
import { z } from 'zod';

export const AssertTopologySchema = z.object({
  channel: z.custom<ConfirmChannel>(),

  queue: z.string({ message: 'Queue must be a string' }),

  routingKey: z.string({ message: 'Routing key must be a string' })
});

export type AssertTopologyDto = z.infer<typeof AssertTopologySchema>;
