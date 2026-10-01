import { z } from 'zod';

import { ChangeEmailRequestSchema } from '../request/change-email-request.dto';

export const ChangeEmailSchema = ChangeEmailRequestSchema.extend({ userId: z.string({ message: 'User ID must be a string' }) });

export type ChangeEmailDto = z.infer<typeof ChangeEmailSchema>;
