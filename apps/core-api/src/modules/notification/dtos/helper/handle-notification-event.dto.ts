import { Logger } from '@nestjs/common';
import { z } from 'zod';
import { NotificationType } from '@common/libs';

import { EventTitleSchema } from '../notification/event-title.dto';
import { NotificationService } from '../../notification.service';

export const HandleNotificationEventSchema = z.object({
  title: EventTitleSchema,

  notificationType: z.enum(NotificationType, { message: 'Notification type must be a valid notification type' }),

  eventType: z.string({ message: 'Event type must be a string' }),

  payload: z.record(z.string(), z.unknown(), { message: 'Payload must be an object' }),

  userId: z.string({ message: 'User ID must be a string' }).optional(),

  content: z.string({ message: 'Content must be a string' }),

  logger: z.custom<Logger>(),

  notificationService: z.custom<NotificationService>()
});

export type HandleNotificationEventDto = z.infer<typeof HandleNotificationEventSchema>;
