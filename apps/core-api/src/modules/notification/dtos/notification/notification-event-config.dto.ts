import { Logger } from '@nestjs/common';
import { z } from 'zod';
import { NotificationType, RequestContext, UnknownRecord } from '@common/libs';

import { NotificationService } from '../../notification.service';

export const NotificationEventConfigSchema = z.object({
  title: z.string({ message: 'Notification title must be a string' }),

  notificationType: z.enum(NotificationType, { message: 'Notification type must be a valid notification type' }),

  getUserId: z.function(),

  getContent: z.function()
});

export type NotificationEventConfigDto<TPayload extends UnknownRecord = UnknownRecord> = z.infer<typeof NotificationEventConfigSchema> & {
  getUserId: (payload: TPayload) => Promise<string | undefined> | string | undefined;
  getContent: (payload: TPayload) => Promise<string> | string;
};

export type NotificationEventDto<TPayload extends UnknownRecord = UnknownRecord> = {
  payload: TPayload;
  eventType: string;
};

export type NotificationEventInput<TPayload extends UnknownRecord = UnknownRecord> = NotificationEventDto<TPayload> & {
  title: EventTitle;
  notificationType: NotificationType;
  notificationService: NotificationService;
  logger: Logger;
  getUserId: (payload: TPayload) => Promise<string | undefined> | string | undefined;
  getContent: (payload: TPayload) => Promise<string> | string;
};

export type MarkNotificationReadDto = { notificationId: string; context: RequestContext };

export type GetNotificationsDto = { context: RequestContext; limit: number | undefined };

export type EventTitle = 'Payment Completed' | 'Payment Failed' | 'Welcome!' | 'Wallet Credited' | 'Wallet Debited';
