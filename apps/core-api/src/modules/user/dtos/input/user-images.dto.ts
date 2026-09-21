import { z } from 'zod';

import { UserImagesRequestSchema } from '../request/user-images-request.dto';

export const UserImagesSchema = UserImagesRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type UserImagesDto = z.infer<typeof UserImagesSchema>;
