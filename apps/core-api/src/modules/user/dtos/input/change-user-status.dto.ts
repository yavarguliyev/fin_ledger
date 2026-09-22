import { z } from 'zod';
import { UserStatus } from '@common/libs';

export const ChangeUserStatusSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  actorId: z.string({ message: 'Actor ID must be a string' }),

  status: z.enum(UserStatus, { message: 'Status must be a valid user status' })
});

export type ChangeUserStatusDto = z.infer<typeof ChangeUserStatusSchema>;
