import { z } from 'zod';

export const BuildEnrollmentSchema = z.object({
  secret: z.string({ message: 'Secret must be a string' }),

  accountName: z.string({ message: 'Account name must be a string' })
});

export type BuildEnrollmentDto = z.infer<typeof BuildEnrollmentSchema>;
