import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { UserDto } from '../user/user.dto';

export const UpdateUserRecordSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  updates: z.custom<Partial<UserDto>>(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type UpdateUserRecordDto = z.infer<typeof UpdateUserRecordSchema>;
