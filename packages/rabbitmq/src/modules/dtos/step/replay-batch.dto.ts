import { z } from 'zod';
import type { Logger } from '@nestjs/common';
import type { ConfirmChannel } from 'amqplib';

export const ReplayBatchSchema = z.object({
  channel: z.custom<ConfirmChannel>(),

  queue: z.string({ message: 'Queue must be a string' }),

  limit: z.number({ message: 'Limit must be a number' }).int().positive(),

  logger: z.custom<Logger>()
});

export type ReplayBatchDto = z.infer<typeof ReplayBatchSchema>;
