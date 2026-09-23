import { z } from 'zod';
import type { ConfirmChannel } from 'amqplib';

export const ConfirmedPublishSchema = z.object({
  channel: z.custom<ConfirmChannel>(),

  exchange: z.string({ message: 'Exchange must be a string' }),

  routingKey: z.string({ message: 'Routing key must be a string' }),

  content: z.custom<Buffer>(),

  persistent: z.boolean({ message: 'Persistent must be a boolean' }),

  headers: z.record(z.string(), z.unknown()).optional()
});

export type ConfirmedPublishDto = z.infer<typeof ConfirmedPublishSchema>;
