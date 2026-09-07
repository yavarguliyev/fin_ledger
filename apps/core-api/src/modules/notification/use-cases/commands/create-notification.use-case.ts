import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { NotificationRepository } from '../../repositories/notification.repository';
import { NotificationStreamProvider } from '../../providers/notification-stream.provider';
import { CreateNotificationDto } from '../../dtos/notification/create-notification.dto';
import { NotificationDto } from '../../dtos/notification/notification.dto';
import { NotificationBaseUseCase } from '../base/base-notification.use-case';

@Injectable()
export class CreateNotificationUseCase extends NotificationBaseUseCase<CreateNotificationDto, NotificationDto> {
  constructor (
    private readonly notificationRepository: NotificationRepository,
    private readonly streamProvider: NotificationStreamProvider
  ) {
    super();
  }

  async execute (dto: CreateNotificationDto): Promise<NotificationDto> {
    const notification = await this.notificationRepository.createNotification(dto);
    if (!notification) throw new InternalServerErrorException('Failed to create notification');
    this.streamProvider.broadcast(dto.userId, notification);
    return notification;
  }
}
