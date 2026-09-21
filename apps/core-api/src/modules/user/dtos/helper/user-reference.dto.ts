import { z } from 'zod';

import { UserSchema } from '../user/user.dto';

export const UserReferenceSchema = z.object({
  user: UserSchema
});

export type UserReferenceDto = z.infer<typeof UserReferenceSchema>;
