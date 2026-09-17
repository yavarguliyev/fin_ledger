import { CreatedAt, Id, NotificationType, UpdatedAt, UserId } from './base.model';

export interface AppNotification extends Id, UserId, CreatedAt, UpdatedAt {
  title: string;
  content: string;
  status: string;
  type: NotificationType;
}
