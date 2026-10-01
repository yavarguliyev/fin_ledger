import type { Logger } from '@nestjs/common';
import type { ChannelModel, ConfirmChannel } from 'amqplib';
import { z } from 'zod';

export const CloseConnectionSchema = z.object({
  channel: z.custom<ConfirmChannel>().nullable(),

  connection: z.custom<ChannelModel>().nullable(),

  logger: z.custom<Logger>()
});

export type CloseConnectionDto = z.infer<typeof CloseConnectionSchema>;
