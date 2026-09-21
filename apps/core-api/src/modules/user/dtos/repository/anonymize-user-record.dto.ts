import { z } from 'zod';

export const AnonymizeUserRecordSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  email: z.string({ message: 'Email must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' })
});

export type AnonymizeUserRecordDto = z.infer<typeof AnonymizeUserRecordSchema>;
