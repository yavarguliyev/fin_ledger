import { z } from 'zod';

export const SubscriberInstanceSchema = z.object({
  instance: z.custom<object>()
});

export type SubscriberInstanceDto = z.infer<typeof SubscriberInstanceSchema>;
