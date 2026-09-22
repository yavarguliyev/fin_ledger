import { z } from 'zod';

export const LinkTokenSchema = z.object({
  token: z.string({ message: 'Token must be a string' })
});

export type LinkTokenDto = z.infer<typeof LinkTokenSchema>;
