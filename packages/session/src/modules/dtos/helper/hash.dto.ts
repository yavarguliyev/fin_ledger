import { z } from 'zod';

export const HashSchema = z.object({
  password: z.string({ message: 'Password must be a string' })
});

export type HashDto = z.infer<typeof HashSchema>;
