import { z } from 'zod';

import { CallRenegotiateRequestSchema } from '../request/call-renegotiate-request.dto';

export const RelayRenegotiationSchema = CallRenegotiateRequestSchema.extend({
  callId: z.string({ message: 'Call ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' })
});

export type RelayRenegotiationDto = z.infer<typeof RelayRenegotiationSchema>;
