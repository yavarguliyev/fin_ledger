import { z } from 'zod';

import { NotificationSchema } from '../notification/notification.dto';

export const NotificationPageItemSchema = NotificationSchema.extend({
  createdAt: z.string({ message: 'Created at must be a string' })
});

export type NotificationPageItemDto = z.infer<typeof NotificationPageItemSchema>;
