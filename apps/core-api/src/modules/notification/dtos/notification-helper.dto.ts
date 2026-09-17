import { UnknownRecord } from '@common/libs';

import { NotificationEventInput } from './notification/notification-event-config.dto';

export type HandleNotificationEventDto<TPayload extends UnknownRecord = UnknownRecord> = NotificationEventInput<TPayload>;

export type { NotificationEventInput };
