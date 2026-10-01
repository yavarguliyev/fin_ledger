import { z } from 'zod';

export const CookieOptionsSchema = z.object({
  secure: z.boolean({ message: 'Secure must be a boolean' })
});

export type CookieOptionsDto = z.infer<typeof CookieOptionsSchema>;
