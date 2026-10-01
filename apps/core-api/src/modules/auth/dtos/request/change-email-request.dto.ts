import { z } from 'zod';

export const ChangeEmailRequestSchema = z.object({
  newEmail: z.email({ message: 'New email must be a valid email address' }),

  currentPassword: z.string({ message: 'Current password must be a string' }).min(1, { message: 'Current password is required' })
});

export type ChangeEmailRequestDto = z.infer<typeof ChangeEmailRequestSchema>;
