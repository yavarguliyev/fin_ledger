import { z } from 'zod';

export const CompareSchema = z.object({
  password: z.string({ message: 'Password must be a string' }),

  passwordHash: z.string({ message: 'Password hash must be a string' })
});

export type CompareDto = z.infer<typeof CompareSchema>;
