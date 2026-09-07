import { z } from 'zod';

import { SessionUserSchema } from '../../../auth/dtos/auth/session-user.dto';

export type UserDto = z.infer<typeof SessionUserSchema>;

export type DeleteUserDto = { success: boolean; message: string };

export type UpdateEmailVerificationInput = { userId: string; isEmailVerified: boolean };
