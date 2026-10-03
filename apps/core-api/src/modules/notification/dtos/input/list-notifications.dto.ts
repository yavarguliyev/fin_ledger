import { z } from 'zod';

import { ListNotificationsRequestSchema } from '../request/list-notifications-request.dto';

export const ListNotificationsSchema = ListNotificationsRequestSchema.and(z.object({ userId: z.string({ message: 'User ID must be a string' }) }));

export type ListNotificationsDto = z.infer<typeof ListNotificationsSchema>;
