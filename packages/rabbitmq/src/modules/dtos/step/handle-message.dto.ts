import { z } from 'zod';
import type { Logger } from '@nestjs/common';
import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { HandleRecord } from '@common/shared-libs';

export const HandleMessageSchema = z.object({
  channel: z.custom<ConfirmChannel>(),

  queue: z.string({ message: 'Queue must be a string' }),

  message: z.custom<ConsumeMessage | null>(),

  handler: z.custom<HandleRecord>(),

  logger: z.custom<Logger>()
});

export type HandleMessageDto = z.infer<typeof HandleMessageSchema>;
