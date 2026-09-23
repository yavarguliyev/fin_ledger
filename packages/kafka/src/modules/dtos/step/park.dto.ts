import { z } from 'zod';
import type { Logger } from '@nestjs/common';
import type { EachMessagePayload } from 'kafkajs';

import { KafkaSendDto } from '../service/kafka-send.dto';

export const ParkSchema = z.object({
  payload: z.custom<EachMessagePayload>(),

  handlerName: z.string({ message: 'Handler name must be a string' }),

  attempt: z.number({ message: 'Attempt must be a number' }).int().positive(),

  lastError: z.string({ message: 'Last error must be a string' }),

  send: z.custom<(message: KafkaSendDto) => Promise<void>>(),

  logger: z.custom<Logger>()
});

export type ParkDto = z.infer<typeof ParkSchema>;
