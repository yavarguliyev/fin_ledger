import type { Logger } from '@nestjs/common';
import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { z } from 'zod';

import { ConsumedMessageDto } from './consumed-message.dto';

export const HandleMessageSchema = z.object({
  channel: z.custom<ConfirmChannel>(),

  queue: z.string({ message: 'Queue must be a string' }),

  message: z.custom<ConsumeMessage | null>(),

  deliver: z.custom<(consumed: ConsumedMessageDto) => Promise<void>>(),

  logger: z.custom<Logger>()
});

export type HandleMessageDto = z.infer<typeof HandleMessageSchema>;
