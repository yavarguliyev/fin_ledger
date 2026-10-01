import { z } from 'zod';
import { SupportCallMedia } from '@common/libs';

import { SUPPORT_CALL } from '../../constants/call/support-call.constant';

export const StartCallRequestSchema = z.object({
  conversationId: z.uuid({ message: 'Conversation ID must be a valid UUID' }),

  media: z.enum(SupportCallMedia, { message: 'Media must be AUDIO or VIDEO' }),

  sdp: z.string({ message: 'SDP must be a string' }).min(1).max(SUPPORT_CALL.SDP_MAX_LENGTH)
});

export type StartCallRequestDto = z.infer<typeof StartCallRequestSchema>;
