import { z } from 'zod';

export const UserCreateResponseSchema = z.object({
  success: z.boolean({ message: 'Success must be a boolean' }),

  message: z.string({ message: 'Message must be a string' }),

  token: z.string({ message: 'Token must be a string' }).optional()
});

export type UserCreateResponseDto = z.infer<typeof UserCreateResponseSchema>;
