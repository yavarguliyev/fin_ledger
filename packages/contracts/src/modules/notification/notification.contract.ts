import { z } from 'zod';

import { NOTIFICATION_STATUSES, NOTIFICATION_TYPES } from './notification-values.contract';

export const NotificationContractSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  title: z.string({ message: 'Title must be a string' }),

  content: z.string({ message: 'Content must be a string' }),

  type: z.enum(NOTIFICATION_TYPES, { message: 'Notification type must be a valid notification type' }),

  status: z.enum(NOTIFICATION_STATUSES, { message: 'Notification status must be a valid notification status' }),

  sentAt: z.string({ message: 'Sent at must be a string' }).nullable(),

  readAt: z.string({ message: 'Read at must be a string' }).nullable()
});

export type NotificationContract = z.infer<typeof NotificationContractSchema>;
