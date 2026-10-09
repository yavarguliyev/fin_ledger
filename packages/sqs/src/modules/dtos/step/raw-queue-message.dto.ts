import { z } from 'zod';

export const RawQueueMessageSchema = z.object({
  body: z.string({ message: 'Body must be a string' }),

  attributes: z.record(z.string(), z.string())
});

export type RawQueueMessageDto = z.infer<typeof RawQueueMessageSchema>;
