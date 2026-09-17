import { UnknownRecord } from '@common/libs';

import { HandleNotificationEventDto } from '../dtos/notification-helper.dto';

export class NotificationHelper {
  public static async handleEvent<TPayload extends UnknownRecord> (event: HandleNotificationEventDto<TPayload>): Promise<void> {
    const { payload, eventType, getUserId, getContent, notificationService, title, notificationType, logger } = event;

    const userId = await getUserId(payload);

    if (userId) {
      await notificationService.createNotification({
        userId,
        title,
        type: notificationType,
        content: await getContent(payload)
      });

      logger.log(`Received ${eventType} event: ${JSON.stringify(payload)}`);
    }
  }
}
