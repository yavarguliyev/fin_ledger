import type { Logger } from '@nestjs/common';
import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { z } from 'zod';
import { HandleRecord } from '@common/shared-libs';
import type { InboxRepository } from '@common/database';

export const HandleMessageSchema = z.object({
  channel: z.custom<ConfirmChannel>(),

  queue: z.string({ message: 'Queue must be a string' }),

  message: z.custom<ConsumeMessage | null>(),

  handler: z.custom<HandleRecord>(),

  inbox: z.custom<InboxRepository>().optional(),

  logger: z.custom<Logger>()
});

export type HandleMessageDto = z.infer<typeof HandleMessageSchema>;
