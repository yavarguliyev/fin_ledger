import { AppNotification } from '../../types/notification/app-notification.type';
import { SSE_RECONNECT } from '../../constants/notification/sse.constant';
import { MergeNotificationsDto } from '../../dtos/notification/merge-notifications.dto';

export class NotificationMergeHelper {
  static backoffMs ({ attempt }: { attempt: number }): number {
    const base = Math.min(SSE_RECONNECT.BASE_DELAY_MS * 2 ** (attempt - 1), SSE_RECONNECT.MAX_DELAY_MS);
    const jitter = base * SSE_RECONNECT.JITTER_RATIO * Math.random();

    return Math.round(base - base * SSE_RECONNECT.JITTER_RATIO + jitter * 2);
  }

  static merge ({ current, incoming }: MergeNotificationsDto): AppNotification[] {
    const byId = new Map<string, AppNotification>();

    [...incoming, ...current].forEach(notification => {
      if (!byId.has(notification.id)) byId.set(notification.id, notification);
    });

    return [...byId.values()].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }
}
