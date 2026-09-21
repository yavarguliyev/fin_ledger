import { z } from 'zod';

export const DeleteUserResponseSchema = z.object({
  success: z.boolean({ message: 'Success must be a boolean' }),

  message: z.string({ message: 'Message must be a string' })
});

export type DeleteUserResponseDto = z.infer<typeof DeleteUserResponseSchema>;
