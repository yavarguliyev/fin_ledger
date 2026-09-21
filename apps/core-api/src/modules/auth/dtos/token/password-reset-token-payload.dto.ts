import { z } from 'zod';

export const PasswordResetTokenPayloadSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  email: z.string({ message: 'Email must be a string' }),

  purpose: z.literal('password_reset', { message: 'Purpose must be password_reset' })
});

export type PasswordResetTokenPayloadDto = z.infer<typeof PasswordResetTokenPayloadSchema>;
