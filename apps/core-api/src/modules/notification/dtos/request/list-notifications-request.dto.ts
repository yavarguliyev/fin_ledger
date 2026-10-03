import { z } from 'zod';

import { NOTIFICATION_LIST } from '../../constants/list/notification-list.constant';

export const ListNotificationsRequestSchema = z
  .object({
    limit: z.coerce.number({ message: 'Limit must be a number' }).int().positive().max(NOTIFICATION_LIST.MAX_LIMIT).default(NOTIFICATION_LIST.DEFAULT_LIMIT),

    before: z.iso.datetime({ offset: true, message: 'Before must be an ISO date-time' }).optional(),

    beforeId: z.uuid({ message: 'Before ID must be a UUID' }).optional()
  })
  .refine(({ before, beforeId }) => !before === !beforeId, { message: NOTIFICATION_LIST.CURSOR_MESSAGE });

export type ListNotificationsRequestDto = z.infer<typeof ListNotificationsRequestSchema>;
