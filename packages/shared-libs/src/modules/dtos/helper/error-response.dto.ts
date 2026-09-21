import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  message: z.string({ message: 'Message must be a string' }),

  stack: z.string().optional()
});

export type ErrorResponseDto = z.infer<typeof ErrorResponseSchema>;
