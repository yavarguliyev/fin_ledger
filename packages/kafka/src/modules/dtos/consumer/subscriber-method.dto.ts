import { z } from 'zod';

export const SubscriberMethodSchema = z.object({
  instance: z.custom<object>(),

  methodName: z.custom<string | symbol>()
});

export type SubscriberMethodDto = z.infer<typeof SubscriberMethodSchema>;
