import { CreatedAt, Id, NotificationType, UpdatedAt, UserId } from './base.mode';

export interface AppNotification extends Id, UserId, CreatedAt, UpdatedAt {
  title: string;
  content: string;
  status: string;
  type: NotificationType;
}
