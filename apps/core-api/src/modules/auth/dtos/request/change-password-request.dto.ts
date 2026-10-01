import { z } from 'zod';

import { PASSWORD_RULES } from '../../constants/validation/password-rules.constant';

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string({ message: 'Current password must be a string' }).min(1, { message: 'Current password is required' }),

  newPassword: z
    .string({ message: 'New password must be a string' })
    .min(PASSWORD_RULES.MIN_LENGTH, { message: PASSWORD_RULES.LENGTH_MESSAGE })
    .max(PASSWORD_RULES.MAX_LENGTH, { message: PASSWORD_RULES.MAX_LENGTH_MESSAGE })
});

export type ChangePasswordRequestDto = z.infer<typeof ChangePasswordRequestSchema>;
