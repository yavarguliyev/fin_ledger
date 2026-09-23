import { z } from 'zod';
import type { Logger } from '@nestjs/common';
import type { ConfirmChannel } from 'amqplib';

export const CancelConsumersSchema = z.object({
  channel: z.custom<ConfirmChannel>(),

  consumerTags: z.array(z.string({ message: 'Consumer tag must be a string' })),

  logger: z.custom<Logger>()
});

export type CancelConsumersDto = z.infer<typeof CancelConsumersSchema>;
