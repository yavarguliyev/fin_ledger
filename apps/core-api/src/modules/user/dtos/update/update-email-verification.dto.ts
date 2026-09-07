import { z } from 'zod';

export const UpdateEmailVerificationSchema = z.object({
  isEmailVerified: z.boolean({ message: 'isEmailVerified must be a boolean' })
});

export type UpdateEmailVerificationDto = z.infer<typeof UpdateEmailVerificationSchema>;
