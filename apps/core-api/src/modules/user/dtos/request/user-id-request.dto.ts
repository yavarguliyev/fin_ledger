import { z } from 'zod';

export const UserIdRequestSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type UserIdRequestDto = z.infer<typeof UserIdRequestSchema>;
