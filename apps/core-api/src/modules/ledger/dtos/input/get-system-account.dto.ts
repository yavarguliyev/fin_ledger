import { z } from 'zod';

export const GetSystemAccountSchema = z.object({
  currency: z.string({ message: 'Currency must be a string' }).length(3, { message: 'Currency must be a 3-character ISO code' })
});

export type GetSystemAccountDto = z.infer<typeof GetSystemAccountSchema>;
