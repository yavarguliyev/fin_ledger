import { HandleNotificationEventDto } from '../dtos/helper/handle-notification-event.dto';

export class NotificationHelper {
  static async handleEvent (event: HandleNotificationEventDto): Promise<void> {
    const { payload, eventType, userId, content, notificationService, title, notificationType, logger } = event;
    if (!userId) return;

    await notificationService.createNotification({ userId, title, type: notificationType, content });
    logger.log(`Received ${eventType} event: ${JSON.stringify(payload)}`);
  }
}
