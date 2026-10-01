import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  refreshToken: z.string({ message: 'Refresh token must be a string' }).min(1, { message: 'Refresh token is required' })
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
