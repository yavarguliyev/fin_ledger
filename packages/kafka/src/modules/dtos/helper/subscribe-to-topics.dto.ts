import { z } from 'zod';

import type { Consumer } from 'kafkajs';

export const SubscribeToTopicsSchema = z.object({
  consumer: z.custom<Consumer>(),

  topics: z.array(z.string())
});

export type SubscribeToTopicsDto = z.infer<typeof SubscribeToTopicsSchema>;
