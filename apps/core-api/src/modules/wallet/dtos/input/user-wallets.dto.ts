import { z } from 'zod';

export const UserWalletsSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type UserWalletsDto = z.infer<typeof UserWalletsSchema>;
