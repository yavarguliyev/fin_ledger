import { z } from 'zod';

export const UpdateEmailVerificationSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  isEmailVerified: z.boolean({ message: 'isEmailVerified must be a boolean' })
});

export type UpdateEmailVerificationDto = z.infer<typeof UpdateEmailVerificationSchema>;
