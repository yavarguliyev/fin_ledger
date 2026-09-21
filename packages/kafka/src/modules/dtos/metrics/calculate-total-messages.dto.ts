import { z } from 'zod';

import type { Admin, ITopicMetadata } from 'kafkajs';

export const CalculateTotalMessagesSchema = z.object({
  admin: z.custom<Admin>(),

  topicMetadata: z.custom<{ topics: ITopicMetadata[] }>()
});

export type CalculateTotalMessagesDto = z.infer<typeof CalculateTotalMessagesSchema>;
