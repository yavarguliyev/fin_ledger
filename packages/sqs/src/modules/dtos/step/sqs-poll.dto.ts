import { z } from 'zod';
import { BrokerSubscribeSchema } from '@common/messaging';

export const SqsPollSchema = z.object({
  subscription: BrokerSubscribeSchema,

  queueUrl: z.string({ message: 'Queue URL must be a string' }),

  signal: z.custom<AbortSignal>()
});

export type SqsPollDto = z.infer<typeof SqsPollSchema>;
