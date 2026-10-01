import { z } from 'zod';

export const RefreshSessionSchema = z.object({
  refreshToken: z.string({ message: 'Refresh token must be a string' }).min(1, { message: 'Refresh token is required' }).optional()
});

export type RefreshSessionDto = z.infer<typeof RefreshSessionSchema>;
