import { z } from 'zod';
import { SupportDeleteScope } from '@common/libs';

import { SUPPORT_HISTORY } from '../../constants/support-history.constant';

export const DeleteMessagesRequestSchema = z.object({
  messageIds: z
    .array(z.string({ message: 'Message ID must be a string' }).min(1, { message: 'Message ID is required' }), { message: 'Message IDs must be a list' })
    .min(1, { message: 'Pick at least one message' })
    .max(SUPPORT_HISTORY.MAX_MESSAGES, { message: 'Too many messages at once' }),

  scope: z.enum(SupportDeleteScope, { message: 'Scope must be ME or EVERYONE' })
});

export type DeleteMessagesRequestDto = z.infer<typeof DeleteMessagesRequestSchema>;
