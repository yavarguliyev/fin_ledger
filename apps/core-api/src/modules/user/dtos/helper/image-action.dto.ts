import { z } from 'zod';

import { UpdateUserSchema } from '../input/update-user.dto';
import { UserDto, UserSchema } from '../user/user.dto';

export const ImageActionSchema = z.object({
  request: UpdateUserSchema,

  user: UserSchema,

  updates: z.custom<Partial<UserDto>>()
});

export type ImageActionDto = z.infer<typeof ImageActionSchema>;
