import { z } from 'zod';

import type { ITopicMetadata } from 'kafkajs';

export const ReplicatedPartitionsSchema = z.object({
  topicMetadata: z.custom<{ topics: ITopicMetadata[] }>()
});

export type ReplicatedPartitionsDto = z.infer<typeof ReplicatedPartitionsSchema>;
