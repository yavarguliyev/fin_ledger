import { z } from 'zod';

import { SUPPORT } from '../../constants/chat/support.constant';

export const ListConversationsRequestSchema = z.object({
  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .int({ message: 'Limit must be an integer' })
    .positive({ message: 'Limit must be positive' })
    .max(SUPPORT.PAGE_SIZE_MAX, { message: 'Limit is too large' })
    .optional(),

  offset: z.coerce
    .number({ message: 'Offset must be a number' })
    .int({ message: 'Offset must be an integer' })
    .min(0, { message: 'Offset cannot be negative' })
    .optional()
});

export type ListConversationsRequestDto = z.infer<typeof ListConversationsRequestSchema>;
