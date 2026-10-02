import { z } from 'zod';

import { SUPPORT } from '../../constants/chat/support.constant';

export const SendMessageRequestSchema = z.object({
  body: z
    .string({ message: 'Body must be a string' })
    .trim()
    .min(1, { message: 'Body is required' })
    .max(SUPPORT.BODY_MAX_LENGTH, { message: 'Body is too long' }),

  replyToMessageId: z.uuid({ message: 'Reply target must be a message ID' }).optional()
});

export type SendMessageRequestDto = z.infer<typeof SendMessageRequestSchema>;
