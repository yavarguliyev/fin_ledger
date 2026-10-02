import { AppNotification } from '../../types/notification/app-notification.type';

export interface MergeNotificationsDto {
  current: AppNotification[];
  incoming: AppNotification[];
}
