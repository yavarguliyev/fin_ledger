import { z } from 'zod';

export const ForgotPasswordResponseSchema = z.object({
  status: z.boolean({ message: 'Status must be a boolean' }),

  message: z.string({ message: 'Message must be a string' })
});

export type ForgotPasswordResponseDto = z.infer<typeof ForgotPasswordResponseSchema>;
