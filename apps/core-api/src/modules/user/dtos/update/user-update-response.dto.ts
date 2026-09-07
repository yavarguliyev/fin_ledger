import { z } from 'zod';
import { TOKEN_TYPES } from '@common/libs';

import { UserResponseSchema } from '../user/user-response.dto';

export const UserUpdateRecordSchema = z.object({
  user: UserResponseSchema,

  accessToken: z.string({ message: 'Access token must be a string' }),

  expiresIn: z.number({ message: 'Expires in must be a number' }),

  tokenType: z.enum(TOKEN_TYPES, { message: 'Token type must be a valid token type' })
});

export type UserUpdateResponeDto = z.infer<typeof UserUpdateRecordSchema>;
