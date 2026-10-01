import { z } from 'zod';
import { TOKEN_TYPES } from '@common/libs';
import { SessionUserContractSchema } from '@common/contracts';

export const AuthResponseSchema = z.object({
  accessToken: z.string({ message: 'Access token must be a string' }),

  expiresIn: z.number({ message: 'Expires in must be a number' }),

  tokenType: z.enum(TOKEN_TYPES, { message: 'Token type must be a valid token type' }),

  refreshToken: z.string({ message: 'Refresh token must be a string' }).optional(),

  user: SessionUserContractSchema
});

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;
