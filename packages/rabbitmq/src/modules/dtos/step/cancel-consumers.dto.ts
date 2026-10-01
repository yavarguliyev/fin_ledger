import type { Logger } from '@nestjs/common';
import type { ConfirmChannel } from 'amqplib';
import { z } from 'zod';

export const CancelConsumersSchema = z.object({
  channel: z.custom<ConfirmChannel>(),

  consumerTags: z.array(z.string({ message: 'Consumer tag must be a string' })),

  logger: z.custom<Logger>()
});

export type CancelConsumersDto = z.infer<typeof CancelConsumersSchema>;
