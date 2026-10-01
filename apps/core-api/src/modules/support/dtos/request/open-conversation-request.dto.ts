import { z } from 'zod';

import { SUPPORT } from '../../constants/chat/support.constant';

export const OpenConversationRequestSchema = z.object({
  staffUserId: z.uuid({ message: 'Staff user ID must be a valid UUID' }),

  subject: z.string({ message: 'Subject must be a string' }).trim().max(SUPPORT.SUBJECT_MAX_LENGTH, { message: 'Subject is too long' }).optional()
});

export type OpenConversationRequestDto = z.infer<typeof OpenConversationRequestSchema>;
