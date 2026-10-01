import { z } from 'zod';

import { StartCallRequestSchema } from '../request/start-call-request.dto';

export const StartCallSchema = StartCallRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  role: z.string({ message: 'Role must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' })
});

export type StartCallDto = z.infer<typeof StartCallSchema>;
