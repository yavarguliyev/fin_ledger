import { z } from 'zod';
import type { Logger } from '@nestjs/common';
import type { ConfirmChannel, Message } from 'amqplib';

export const SettleMessageSchema = z.object({
  channel: z.custom<ConfirmChannel>(),

  message: z.custom<Message>(),

  requeue: z.boolean({ message: 'Requeue must be a boolean' }),

  logger: z.custom<Logger>()
});

export type SettleMessageDto = z.infer<typeof SettleMessageSchema>;
