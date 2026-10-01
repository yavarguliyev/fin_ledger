import { z } from 'zod';

import { UpdateUserSchema } from '../input/update-user.dto';
import { UserDto, UserSchema } from '../user/user.dto';

export const ApplyIdentityFieldsSchema = z.object({
  dto: UpdateUserSchema,

  user: UserSchema,

  updates: z.custom<Partial<UserDto>>()
});

export type ApplyIdentityFieldsDto = z.infer<typeof ApplyIdentityFieldsSchema>;
