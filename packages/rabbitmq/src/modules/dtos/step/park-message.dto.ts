import { z } from 'zod';
import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import type { Logger } from '@nestjs/common';

export const ParkMessageSchema = z.object({
  channel: z.custom<ConfirmChannel>(),

  logger: z.custom<Logger>(),

  queue: z.string({ message: 'Queue must be a string' }),

  message: z.custom<ConsumeMessage>(),

  attempt: z.number({ message: 'Attempt must be a number' }).int().positive(),

  lastError: z.string({ message: 'Last error must be a string' })
});

export type ParkMessageDto = z.infer<typeof ParkMessageSchema>;
