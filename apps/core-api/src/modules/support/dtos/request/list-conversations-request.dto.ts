import { z } from 'zod';

import { SUPPORT } from '../../constants/chat/support.constant';

export const ListConversationsRequestSchema = z
  .object({
    limit: z.coerce
      .number({ message: 'Limit must be a number' })
      .int({ message: 'Limit must be an integer' })
      .positive({ message: 'Limit must be positive' })
      .max(SUPPORT.PAGE_SIZE_MAX, { message: 'Limit is too large' })
      .optional(),

    before: z.iso.datetime({ offset: true, message: 'Before must be an ISO date-time' }).optional(),

    beforeId: z.uuid({ message: 'Before ID must be a UUID' }).optional()
  })
  .refine(({ before, beforeId }) => !before === !beforeId, { message: SUPPORT.CURSOR_MESSAGE });

export type ListConversationsRequestDto = z.infer<typeof ListConversationsRequestSchema>;
