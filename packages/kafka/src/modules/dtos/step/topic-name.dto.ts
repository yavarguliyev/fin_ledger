import { z } from 'zod';

export const TopicNameSchema = z.object({
  topic: z.string({ message: 'Topic must be a string' })
});

export type TopicNameDto = z.infer<typeof TopicNameSchema>;
