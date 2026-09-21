import { z } from 'zod';

import { ListNotificationsRequestSchema } from '../request/list-notifications-request.dto';

export const ListNotificationsSchema = ListNotificationsRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' })
});

export type ListNotificationsDto = z.infer<typeof ListNotificationsSchema>;
