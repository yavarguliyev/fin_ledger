import { z } from 'zod';

import { UpdateUserRequestSchema } from '../request/update-user-request.dto';

export const UpdateUserSchema = UpdateUserRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
