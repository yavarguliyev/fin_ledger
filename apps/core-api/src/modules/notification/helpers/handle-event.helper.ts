import { UnknownRecord } from '@common/libs';

import { NotificationEventInput } from '../dtos/notification/notification-event-config.dto';

export const handleEvent = async <TPayload extends UnknownRecord>(event: NotificationEventInput<TPayload>): Promise<void> => {
  const { payload, eventType, getUserId, getContent, notificationService, title, notificationType, logger } = event;

  const userId = await getUserId(payload);

  if (userId) {
    await notificationService.createNotification({
      userId,
      title: title,
      type: notificationType,
      content: await getContent(payload)
    });

    logger.log(`Received ${eventType} event: ${JSON.stringify(payload)}`);
  }
};
