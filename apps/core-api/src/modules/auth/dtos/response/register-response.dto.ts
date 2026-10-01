import { z } from 'zod';

export const RegisterResponseSchema = z.object({
  success: z.boolean({ message: 'Success must be a boolean' }),

  message: z.string({ message: 'Message must be a string' })
});

export type RegisterResponseDto = z.infer<typeof RegisterResponseSchema>;
