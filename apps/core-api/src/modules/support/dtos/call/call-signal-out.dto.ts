import { z } from 'zod';

import { CallSignalSchema } from './call-signal.dto';
import { StoredCallSchema } from './stored-call.dto';

export const CallSignalOutSchema = z.object({
  type: z.string({ message: 'Type must be a string' }),

  call: StoredCallSchema,

  fromUserId: z.string({ message: 'From user ID must be a string' }),

  extra: CallSignalSchema.pick({ fromName: true, sdp: true, sdpType: true, candidate: true, reason: true }).partial()
});

export type CallSignalOutDto = z.infer<typeof CallSignalOutSchema>;
