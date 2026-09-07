import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  token: z.string({ message: 'Token must be a string' }).min(1, { message: 'Token is required' }),

  password: z
    .string({ message: 'Password must be a string' })
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(100, { message: 'Password must not exceed 100 characters' })
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

export type ResetPasswordResponseDto = {
  success: boolean;
  message: string;
};

export type PasswordResetTokenPayload = {
  userId: string;
  email: string;
  purpose: string;
};
