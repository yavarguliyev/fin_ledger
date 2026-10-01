import { z } from 'zod';

export const ConfirmEmailChangeRequestSchema = z.object({
  token: z.string({ message: 'Token must be a string' }).min(1, { message: 'Token is required' })
});

export type ConfirmEmailChangeRequestDto = z.infer<typeof ConfirmEmailChangeRequestSchema>;
