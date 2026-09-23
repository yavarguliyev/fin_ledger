import { z } from 'zod';
import type { Logger } from '@nestjs/common';
import type { EachMessagePayload } from 'kafkajs';
import { MessageHandler } from '@common/shared-libs';

import { KafkaMessageRecord } from '../../interfaces/kafka-message-record.interface';
import type { InboxRepository } from '@common/database';

import { KafkaSendDto } from '../service/kafka-send.dto';

export const DispatchSchema = z.object({
  handler: z.custom<MessageHandler<KafkaMessageRecord>>(),

  record: z.custom<KafkaMessageRecord>(),

  payload: z.custom<EachMessagePayload>(),

  send: z.custom<(message: KafkaSendDto) => Promise<void>>(),

  consumerGroup: z.string({ message: 'Consumer group must be a string' }),

  inboxRepository: z.custom<InboxRepository>(),

  logger: z.custom<Logger>()
});

export type DispatchDto = z.infer<typeof DispatchSchema>;

export const DispatchAllSchema = DispatchSchema.omit({ handler: true }).extend({
  handlers: z.array(z.custom<MessageHandler<KafkaMessageRecord>>())
});

export type DispatchAllDto = z.infer<typeof DispatchAllSchema>;
