import { z } from 'zod';

export const ResetPasswordResponseSchema = z.object({
  success: z.boolean({ message: 'Success must be a boolean' }),

  message: z.string({ message: 'Message must be a string' })
});

export type ResetPasswordResponseDto = z.infer<typeof ResetPasswordResponseSchema>;
