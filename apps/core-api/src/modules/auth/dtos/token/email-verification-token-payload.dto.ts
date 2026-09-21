import { z } from 'zod';

export const EmailVerificationTokenPayloadSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  email: z.string({ message: 'Email must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  role: z.string({ message: 'Role must be a string' }),

  purpose: z.literal('email_verification', { message: 'Purpose must be email_verification' })
});

export type EmailVerificationTokenPayloadDto = z.infer<typeof EmailVerificationTokenPayloadSchema>;
