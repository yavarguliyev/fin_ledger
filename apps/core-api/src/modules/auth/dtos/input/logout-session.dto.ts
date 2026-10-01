import { z } from 'zod';

import { AuthorizationSchema } from '../request/authorization.dto';
import { LogoutRequestSchema } from '../request/logout-request.dto';

export const LogoutSessionSchema = AuthorizationSchema.extend(LogoutRequestSchema.shape);

export type LogoutSessionDto = z.infer<typeof LogoutSessionSchema>;
