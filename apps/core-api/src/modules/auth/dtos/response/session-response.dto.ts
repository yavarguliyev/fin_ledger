import { z } from 'zod';

import { AuthResponseSchema } from './auth-response.dto';
import { UserUpdateRecordSchema } from '../../../user/dtos/response/user-update-response.dto';

export const SessionResponseSchema = z.union([AuthResponseSchema, UserUpdateRecordSchema]);

export type SessionResponseDto = z.infer<typeof SessionResponseSchema>;
