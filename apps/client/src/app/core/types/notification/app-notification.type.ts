import type { NotificationContract } from '@common/contracts';

export type AppNotification = NotificationContract & {
  createdAt: string;
  updatedAt: string;
};
