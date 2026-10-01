import { z } from 'zod';

export const ResourceOwnershipSchema = z.object({
  resourceId: z.string({ message: 'Resource ID must be a string' }).uuid({ message: 'Resource ID must be a valid UUID' }),

  userId: z.string({ message: 'User ID must be a string' })
});

export type ResourceOwnershipDto = z.infer<typeof ResourceOwnershipSchema>;
