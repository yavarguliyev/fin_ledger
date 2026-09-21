import { z } from 'zod';

export const CreateConsumerConfigSchema = z.object({
  groupId: z.string({ message: 'Group ID must be a string' })
});

export type CreateConsumerConfigDto = z.infer<typeof CreateConsumerConfigSchema>;
