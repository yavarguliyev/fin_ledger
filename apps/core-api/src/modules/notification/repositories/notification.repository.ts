import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, NotificationStatus, PostgresService } from '@common/libs';

import { CreateNotificationDto } from '../dtos/input/create-notification.dto';
import { ListNotificationsDto } from '../dtos/input/list-notifications.dto';
import { MarkNotificationReadDto } from '../dtos/input/mark-notification-read.dto';
import { NotificationDto } from '../dtos/notification/notification.dto';
import { NOTIFICATION_LIST } from '../constants/list/notification-list.constant';

@Injectable()
export class NotificationRepository extends BaseExtendedRepository<NotificationDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'notifications',
      columnMappings: {
        userId: 'user_id',
        dedupeKey: 'dedupe_key',
        lastError: 'last_error',
        sentAt: 'sent_at',
        readAt: 'read_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'userId', 'channel', 'type', 'title', 'content', 'data', 'status', 'sentAt', 'readAt', 'createdAt', 'updatedAt'];
  }

  async createNotification (dto: CreateNotificationDto): Promise<NotificationDto | null> {
    const isSent = dto.status === NotificationStatus.SENT || dto.status === NotificationStatus.READ;

    const { status, ...rest } = dto;

    return this.create({
      data: {
        ...rest,
        ...(status && { status }),
        ...(isSent && { sentAt: new Date().toISOString() }),
        ...(status === NotificationStatus.READ && { readAt: new Date().toISOString() })
      }
    });
  }

  async findByUser ({ userId, limit, before, beforeId }: ListNotificationsDto): Promise<NotificationDto[]> {
    const result = await this.service.getWriteConnection().query<NotificationDto>({
      sql: NOTIFICATION_LIST.KEYSET_SQL,
      params: [userId, before ?? null, beforeId ?? null, limit]
    });
    return result.rows;
  }

  async markAsRead ({ id, userId }: MarkNotificationReadDto): Promise<NotificationDto | null> {
    const notification = await this.findOne({ where: { id, user_id: userId } });
    if (!notification) return null;

    const now = new Date().toISOString();

    return this.updateWhere({
      where: { id, userId },
      data: { status: NotificationStatus.READ, readAt: now, ...(notification.sentAt ? {} : { sentAt: now }) }
    });
  }
}
