import { z } from 'zod';

import { CurrentUserSchema } from '../user/current-user.dto';

export const CurrentUserResponseSchema = z.object({ user: CurrentUserSchema });

export type CurrentUserResponseDto = z.infer<typeof CurrentUserResponseSchema>;
