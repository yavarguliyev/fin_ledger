import { z } from 'zod';

import { EndCallRequestSchema } from '../request/end-call-request.dto';

export const EndCallSchema = EndCallRequestSchema.extend({
  callId: z.string({ message: 'Call ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  role: z.string({ message: 'Role must be a string' })
});

export type EndCallDto = z.infer<typeof EndCallSchema>;
