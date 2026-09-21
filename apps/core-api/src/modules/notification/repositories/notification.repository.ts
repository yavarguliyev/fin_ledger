import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, NotificationStatus, PostgresService } from '@common/libs';

import { CreateNotificationDto } from '../dtos/input/create-notification.dto';
import { ListNotificationsDto } from '../dtos/input/list-notifications.dto';
import { MarkNotificationReadDto } from '../dtos/input/mark-notification-read.dto';
import { NotificationDto } from '../dtos/notification/notification.dto';

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

    return this.create({
      data: {
        ...dto,
        ...(isSent && { sentAt: new Date().toISOString() }),
        ...(dto.status === NotificationStatus.READ && { readAt: new Date().toISOString() })
      }
    });
  }

  async findByUser ({ userId, limit }: ListNotificationsDto): Promise<NotificationDto[]> {
    return this.findAll({ where: { user_id: userId }, orderBy: 'created_at', orderDirection: 'DESC', limit });
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
