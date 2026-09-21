import { z } from 'zod';

export const UserSessionsSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' })
});

export type UserSessionsDto = z.infer<typeof UserSessionsSchema>;
