import { NotificationType } from '../../types/notification/notification-type.type';
import { CreatedAt } from '../base/created-at.interface';
import { Id } from '../base/id.interface';
import { UpdatedAt } from '../base/updated-at.interface';
import { UserId } from '../base/user-id.interface';

export interface AppNotification extends Id, UserId, CreatedAt, UpdatedAt {
  title: string;
  content: string;
  status: string;
  type: NotificationType;
}
