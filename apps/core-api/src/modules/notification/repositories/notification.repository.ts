import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, NotificationStatus, PostgresService } from '@common/libs';

import { CreateNotificationDto } from '../dtos/notification/create-notification.dto';
import { NotificationDto } from '../dtos/notification/notification.dto';

@Injectable()
export class NotificationRepository extends BaseExtendedRepository<NotificationDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'notifications', {
      userId: 'user_id',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'userId', 'type', 'title', 'content', 'status', 'createdAt', 'updatedAt'];
  }

  async createNotification (dto: CreateNotificationDto): Promise<NotificationDto | null> {
    return this.create(dto);
  }

  async findByUserId (userId: string, limit = 50): Promise<NotificationDto[]> {
    return this.findAll({ where: { user_id: userId }, orderBy: 'created_at', orderDirection: 'DESC', limit });
  }

  async markAsRead (notificationId: string, userId: string): Promise<NotificationDto | null> {
    return this.updateWhere({ id: notificationId, userId }, { status: NotificationStatus.READ });
  }
}
