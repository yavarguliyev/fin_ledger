import { z } from 'zod';

import { ChangePasswordRequestSchema } from '../request/change-password-request.dto';

export const ChangePasswordSchema = ChangePasswordRequestSchema.extend({ userId: z.string({ message: 'User ID must be a string' }) });

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
