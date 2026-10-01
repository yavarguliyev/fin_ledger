import { z } from 'zod';
import { NotificationStatus, NotificationType } from '@common/libs';
import { NotificationContractSchema } from '@common/contracts';

export const NotificationSchema = NotificationContractSchema.extend({
  type: z.enum(NotificationType, { message: 'Notification type must be a valid notification type' }),

  status: z.enum(NotificationStatus, { message: 'Notification status must be a valid notification status' }),

  createdAt: z.date({ message: 'Created at must be a valid date' }),

  updatedAt: z.date({ message: 'Updated at must be a valid date' })
});

export type NotificationDto = z.infer<typeof NotificationSchema>;
