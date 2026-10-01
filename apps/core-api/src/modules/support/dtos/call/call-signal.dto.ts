import { z } from 'zod';
import { SupportCallEndReason, SupportCallMedia } from '@common/libs';

import { IceCandidateSchema } from './ice-candidate.dto';

export const CallSignalSchema = z.object({
  callId: z.string({ message: 'Call ID must be a string' }),

  conversationId: z.string({ message: 'Conversation ID must be a string' }),

  media: z.enum(SupportCallMedia),

  fromUserId: z.string({ message: 'From user ID must be a string' }),

  fromName: z.string({ message: 'From name must be a string' }).optional(),

  sdp: z.string({ message: 'SDP must be a string' }).optional(),

  candidate: IceCandidateSchema.optional(),

  reason: z.enum(SupportCallEndReason).optional()
});

export type CallSignalDto = z.infer<typeof CallSignalSchema>;
