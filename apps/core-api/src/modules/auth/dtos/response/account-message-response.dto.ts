import { z } from 'zod';

export const AccountMessageResponseSchema = z.object({
  status: z.boolean({ message: 'Status must be a boolean' }),

  message: z.string({ message: 'Message must be a string' })
});

export type AccountMessageResponseDto = z.infer<typeof AccountMessageResponseSchema>;
