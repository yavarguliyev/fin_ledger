import { z } from 'zod';
import { NotificationStatus, NotificationType } from '@common/libs';

export const NotificationSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  id: z.string({ message: 'ID must be a string' }),

  createdAt: z.date({ message: 'Created at must be a valid date' }),

  updatedAt: z.date({ message: 'Updated at must be a valid date' }),

  title: z.string({ message: 'Title must be a string' }),

  content: z.string({ message: 'Content must be a string' }),

  type: z.enum(NotificationType, { message: 'Notification type must be a valid notification type' }),

  status: z.enum(NotificationStatus, { message: 'Notification status must be a valid notification status' }).optional()
});

export type NotificationDto = z.infer<typeof NotificationSchema>;
