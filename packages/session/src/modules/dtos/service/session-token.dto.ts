import { z } from 'zod';

export const SessionTokenSchema = z.object({
  token: z.string({ message: 'Token must be a string' })
});

export type SessionTokenDto = z.infer<typeof SessionTokenSchema>;
