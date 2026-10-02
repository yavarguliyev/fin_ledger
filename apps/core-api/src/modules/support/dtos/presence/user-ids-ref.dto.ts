import { z } from 'zod';

export const UserIdsRefSchema = z.object({ userIds: z.array(z.string({ message: 'User ID must be a string' })) });

export type UserIdsRefDto = z.infer<typeof UserIdsRefSchema>;
