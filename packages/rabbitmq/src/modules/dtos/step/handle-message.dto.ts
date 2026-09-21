import { z } from 'zod';
import type { ConsumeMessage } from 'amqplib';
import { HandleRecord } from '@common/shared-libs';

export const HandleMessageSchema = z.object({
  message: z.custom<ConsumeMessage | null>(),

  handler: z.custom<HandleRecord>()
});

export type HandleMessageDto = z.infer<typeof HandleMessageSchema>;
