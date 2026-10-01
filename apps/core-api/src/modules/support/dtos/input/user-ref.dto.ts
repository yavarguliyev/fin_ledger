import { z } from 'zod';

export const UserRefSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type UserRefDto = z.infer<typeof UserRefSchema>;
