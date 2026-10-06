export interface NotificationItem {
  id: string;
  title: string;
  createdAt: string;
}

export interface NotificationQuery {
  query: Record<string, string>;
}

export interface NotificationCursor {
  item: NotificationItem | undefined;
}
